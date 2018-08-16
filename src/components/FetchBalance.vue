<template>
    <div class="balance">
        <p> Your balance is: {{ balance }} </p>
        <ul>
            <li v-for="info in userinfos" :key="info.account">
                {{ info.account }} Have {{ info.credits }} Chips in the pocket
            </li>
        </ul>
    </div>
</template>

<script>
import Eos from "eosjs";
const eosOptions = {
  broadcast: true,
  sign: true,
  chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
  httpEndpoint: "http://127.0.0.1:8888"
};
export default {
  props: ["account_name", "symbol"],
  data: () => ({
    eos: null,
    balance: null,
    userinfos: []
  }),
  created() {
    this.eosClient = Eos(eosOptions);
    this.getCurrencyBalance();
  },
  methods: {
    getCurrencyBalance() {
      const { account_name, symbol } = this;
      // 获取EOS
      this.eosClient
        .getCurrencyBalance({
          code: "eosio.token",
          account: account_name,
          symbol
        })
        .then(
          res => {
            console.log(res);
            this.balance = res[0];
          },
          res => {
            console.log(res);
          }
        );

      this.eosClient
        .getTableRows({
          json: "true",
          code: "slot",
          scope: "slot",
          table: "player",
          limit: 10,
          lower_bound: 0
        })
        .then(data => {
          console.log(data);
          this.userinfos = data.rows;
        })
        .catch(e => {
          console.error(e);
        });
    }
  }
};
</script>
