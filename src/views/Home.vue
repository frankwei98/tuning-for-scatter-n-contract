<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <div class="btn-group" v-if="identity">
      <FetchBalance account_name="itegame" symbol="SYS" />
      <h1 class="title">Welcome back! Your ID is: {{ identity.accounts[0].name }}</h1>
      <button class="button" @click="updateAuth">updateAuth</button>
      <button class="button" @click="() => buy(1)">TRANSFER</button>
      <button class="button" @click="() => withdraw(10)">SELL</button>
      <br>
      <button class="button" @click="signOut">LOGOUT</button>
      <button class="button" @click="getPublicKey">getPublicKey</button>
    </div>
    <div class="btn-group" v-else>
      <button class="button" @click="requestId">Fetch Scatter ID</button>
    </div>
    
  </div>
</template>

<script>
// @ is an alias to /src
import { mapState, mapMutations } from "vuex";
import HelloWorld from "@/components/HelloWorld.vue";
import FetchBalance from "@/components/FetchBalance.vue";
import axios from "axios";
import network from "../network.json";

const requiredFields = { accounts: [network] };

export default {
  name: "home",
  data: () => ({
    account_name: "slot"
  }),
  computed: {
    ...mapState(["identity", "scatter", "eos", "account"])
  },
  components: {
    HelloWorld,
    FetchBalance
  },
  created() {
    this.getPublicKey();
  },
  methods: {
    ...mapMutations(["setIdentity"]),
    async suggestNetworkSetting() {
        try {
          await this.scatter.suggestNetwork({
        "protocol": "http",
        "blockchain": "eos",
        "host": "127.0.0.1",
        "port": 8888,
        "chainId": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
    })
        } catch (error) {
          console.info('User canceled to suggestNetwork')
          return;
        }
    },
    notification(msg1, msg2) {
      alert(msg2);
    },
    async requestId() {
      await this.suggestNetworkSetting()
      const identity = await scatter.getIdentity(requiredFields);
      this.setIdentity(identity);
    },
    async signOut(e) {
      try {
        await this.scatter.forgetIdentity(network);
        this.setIdentity(null);
      } catch (error) {}
    },
    async buy(amount) {
      const { account_name } = this;
      this.eos
        .transfer(this.account.name, account_name, `${amount}.0000 SYS`, "")
        .then(() => {
          this.notification("succeeded", "购买成功");
          return Promise.resolve(null);
        })
        .catch(err => {
          this.notification("error", "购买失败");
          return Promise.reject(err);
        });
    },
    async getPublicKey() {
      const { account_name } = this;
      const { data } = await axios({
        method: "post",
        url: "http://127.0.0.1:8888/v1/chain/get_account",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        data: { account_name }
      });
      const { permissions } = data;
      const permission = permissions.find(
        permit => permit.perm_name === "active"
      );
      const { key } = permission.required_auth.keys[0];
      return key;
    },
    updateAuth() {
      this.notification("pending", "正在对合约账户授权");
      return this.getPublicKey()
        .then(key => {
          return this.eos.updateauth({
            account: this.account.name,
            permission: this.account.authority,
            parent: "owner",
            auth: {
              threshold: 1,
              keys: [
                {
                  key: key,
                  weight: 1
                }
              ],
              accounts: [
                {
                  permission: {
                    actor: "slot",
                    permission: "eosio.code"
                  },
                  weight: 1
                }
              ]
            }
          });
        })
        .then(() => {
          this.notification("succeeded", "对合约账户授权成功");
          return Promise.resolve(null);
        })
        .catch(err => {
          this.notification("error", "对合约账户授权失败", err.toString());
          return Promise.reject(err);
        });
    },
    withdraw(amount) {
      this.notification("pending", "正在兑换积分获得(" + amount + ")EOS");
      this.eos
        .contract("slot", { requiredFields })
        .then(contract =>
          contract.sell(this.account.name, parseInt(amount), {
            authorization: [`${this.account.name}@${this.account.authority}`]
          })
        )
        .then(() => {
          this.notification("succeeded", "兑换成功");
        })
        .catch(err => {
          this.notification("error", "兑换失败", err.toString());
        });
    }
  }
};
</script>
