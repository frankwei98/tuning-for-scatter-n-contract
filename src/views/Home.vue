<template>
  <div class="home">
    <img alt="logo" src="../assets/logo.svg" class="logo" >
    <div class="btn-group" v-if="identity">
      <h1 class="title"> The Happy EOS Slot </h1>
      <FetchProfile :account_name="identity.accounts[0].name" symbol="EOS" v-if="identity" />
      <!-- <button class="button" @click="updateAuth">updateAuth</button> -->
      <button class="button" @click="() => buy(1)">Buy Credits</button>
      <button class="button" @click="() => withdraw(10)">Sell Credits</button>
      <button class="button" @click="() => bet(10000000)">Let's Bet</button>
      <br>
      <button class="button is-danger" @click="signOut">LOGOUT</button>
      <!-- <button class="button" @click="getPublicKey">getPublicKey</button> -->
    </div>
    <div class="btn-group" v-else>
      <button class="button" @click="requestId">Fetch Scatter ID</button>
    </div>
    
  </div>
</template>

<script>
// @ is an alias to /src
import { mapState, mapMutations } from "vuex";
import { sha256 } from "eosjs-ecc";
import HelloWorld from "@/components/HelloWorld.vue";
import FetchProfile from "@/components/FetchProfile.vue";
import axios from "axios";
import { networks } from "../config";
const network = networks["eosasia"];
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
    HelloWorld,
    FetchProfile
  },
  created() {
    this.getPublicKey();
  },
  methods: {
    ...mapMutations(["setIdentity"]),
    async suggestNetworkSetting() {
      try {
        await this.scatter.suggestNetwork(network);
      } catch (error) {
        console.info("User canceled to suggestNetwork");
        return;
      }
    },
    notification(msg1, msg2) {
      alert(msg2);
    },
    async requestId() {
      await this.suggestNetworkSetting();
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
        .transfer(this.account.name, account_name, `${amount}.0000 EOS`, "")
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
        url: "https://nodes.get-scatter.com/v1/chain/get_account",
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
    withdraw(amount) {
      this.notification("pending", "正在兑换积分获得(" + amount + ")EOS");
      this.eos
        .contract("happyeosslot", { requiredFields })
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
    },
    bet(amount) {
      const seed = prompt("What is your seed?");
      console.info(`Seed converted into sha256: ${sha256(seed)}`);
      this.eos
        .contract("happyeosslot", { requiredFields })
        .then(contract =>
          contract.bet(this.account.name, parseInt(amount), sha256(seed), {
            authorization: [`${this.account.name}@${this.account.authority}`]
          })
        )
        .then(() => {
          this.notification("succeeded", "BET 交易发送成功");
        })
        .catch(err => {
          this.notification("error", "BET 交易发送失败", err.toString());
        });
    }
  }
};
</script>

<style scoped>
.logo {
  max-width: 16rem;
}
</style>
