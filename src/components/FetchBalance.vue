<template>
    <div class="balance">
        <p> You have {{ balance.eos }} now. </p>
        <ul>
            <li v-for="info in userinfos" :key="info.account">
                {{ info.account }} Have {{ info.credits }} Chips in the pocket
            </li>
        </ul>
    </div>
</template>

<script>
import Eos from "eosjs";
import { eosOptions } from "../config";
const eosOption = eosOptions["eosasia"];

export default {
  props: ["account_name", "symbol"],
  data: () => ({
    eos: null,
    balance: { eos: null },
    userinfos: []
  }),
  created() {
    this.eosClient = Eos(eosOption);
    this.getCurrencyBalance();
  },
  methods: {
    getCurrencyBalance() {
      const { account_name, symbol, balance } = this;
      // 获取EOS
      this.eosClient
        .getCurrencyBalance({
          code: "eosio.token",
          account: account_name
        })
        .then(
          res => {
            const eos = res[0];
            this.balance = Object.assign(balance, { eos });
          },
          res => {
            console.log(res);
          }
        );

      this.eosClient
        .getTableRows({
          json: "true",
          code: "happyeosslot",
          scope: "happyeosslot",
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
