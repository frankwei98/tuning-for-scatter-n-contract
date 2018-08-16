<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <div class="btn-group" v-if="identity">
      <h1 class="title">Welcome back! Your ID is: {{ identity.accounts[0].name }}</h1>
      <button class="button" @click="buy">BUY</button>
      <button class="button" @click="() => deposit('1 EOS')">deposit</button>
      <button class="button" @click="updateAuth">updateAuth</button>
      <button class="button">TRANSFER</button>
      <button class="button">SELL</button>
      <br>
      <button class="button" @click="signOut">LOGOUT</button>
      <button class="button" @click="getPublicKey">getPublicKey</button>
      <button class="button" @click="hi">Greeting from contract</button>
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
import axios from "axios";
import network from "../network.json";

const requiredFields = { accounts: [network] };

export default {
  name: "home",
  data: () => ({
    account_name: "happyeosslot"
  }),
  computed: {
    ...mapState(["identity", "scatter", "eos", "account"])
  },
  components: {
    HelloWorld
  },
  created() {
    this.getPublicKey();
  },
  methods: {
    ...mapMutations(["setIdentity"]),
    notification(msg1, msg2) {
      alert(msg2);
    },
    async requestId() {
      const identity = await scatter.getIdentity(requiredFields);
      this.setIdentity(identity);
    },
    async signOut(e) {
      try {
        await this.scatter.forgetIdentity(network);
        this.setIdentity(null);
      } catch (error) {}
    },
    async buy() {
      this.eos.contract("happyeosslot", requiredFields).then(contract => {
        return contract.buy(this.account.name, "1 SYS", {
          authorization: [`${this.account.name}@${this.account.authority}`]
        });
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
                    actor: "happyeosslot",
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
    deposit(amount) {
      /*
            this.updateAuth()
                .then(() => {
                    this.notification('pending', '正在充值(' + amount + ')EOS');
                    var requiredFields = this.requiredFields;
                    this.eos.contract('happyeosslot', { requiredFields }).then(contract => {
                        console.warn(amount);
                        return contract.buy(this.account.name, amount, { authorization: [`${this.account.name}@${this.account.authority}`] });
                    })
                        .then(() => {
                            this.notification('succeeded', '充值成功');
                        })
                        .catch((err) => {
                            this.notification('error', '充值成功', err.toString());
                        });
                });*/
      this.notification("pending", "正在充值(" + amount + ")EOS");
      var requiredFields = this.requiredFields;
      this.eos
        .contract("happyeosslot", { requiredFields })
        .then(contract => {
          console.warn(amount);
          return contract.buy(this.account.name, amount, {
            authorization: [`${this.account.name}@${this.account.authority}`]
          });
        })
        .then(() => {
          this.notification("succeeded", "充值成功");
        })
        .catch(err => {
          this.notification("error", "充值成功", err.toString());
        });
    },
    withdraw(amount) {
      this.notification("pending", "正在兑换积分获得(" + amount + ")EOS");
      var requiredFields = this.requiredFields;
      this.eos
        .contract("happyeosslot", { requiredFields })
        .then(contract => {
          console.log(contract);
          return contract.sell(this.account.name, parseInt(amount), {
            authorization: [`${this.account.name}@${this.account.authority}`]
          });
        })
        .then(() => {
          this.notification("succeeded", "兑换成功");
        })
        .catch(err => {
          this.notification("error", "兑换失败", err.toString());
        });
    },
    async hi() {
      this.eos.contract("hello", requiredFields).then(contract => {
        return contract.hi(this.account.name, {
          authorization: [`${this.account.name}@${this.account.authority}`]
        });
      });
    }
  }
};
</script>
