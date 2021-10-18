<template>
  <transition name="modal">
    <div class="overlay">
      <div class="header-basic">
        <div class="logo">
          <img src="../assets/logo.png" alt="" />
        </div>
        <ul class="list-inline">
          <li class="list-inline-item">
            <!-- <p v-on:click="toggleClass">About</p> -->
          </li>
        </ul>
        <div class="social">
          <a
            href="https://twitter.com/kausaus_"
            target="_blank"
            rel="noopener noreferrer"
          >
            <font-awesome-icon :icon="['fab', 'twitter']" />
          </a>
        </div>
        <div class="copyright">
          Copyright @2021 | <br />
          Designed With by
          <a
            href="https://twitter.com/kausaus_"
            target="_blank"
            rel="noopener noreferrer"
          >
            @kausaus_
          </a>
        </div>
      </div>
      <About v-show="showModal"></About>
      <div class="panel" @click.stop v-show="!showModal">
        <!-- <button v-on:click="confirm">閉じる</button> -->
        <div class="globalcontainer">
          <h1>Update interval</h1>
          <div class="updateInterval">
            <v-select
              class="style-chooser"
              name="intervalSelect"
              v-bind:options="intervalTimeOptions"
              @input="setIntervalSelected"
            ></v-select>
          </div>
          <!-- <div>
            <label class="switch">
              <h1>Randomize</h1>
              <input type="checkbox" />
              <span class="slider round"></span>
            </label>
          </div> -->
          <h1>CHOOSE COLLECTION</h1>
          <div class="container">
            <div
              v-for="(item, $index) in collections"
              v-bind:key="$index"
              class="item"
              v-bind:class="{ selecteditem: selectItemId === item.id }"
            >
              <a
                v-bind:href="'https://unsplash.com/collections/' + item.id"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div class="itemcontainer">
                  <div class="thumbcontainer">
                    <div class="thumbmain">
                      <div class="thumbmain-1">
                        <img
                          class="thumbimage"
                          v-bind:src="item.preview_photos[0].urls.small"
                        />
                      </div>
                      <div class="thumbmain-2">
                        <div class="thumbmain-2_inner">
                          <img
                            class="thumbimage"
                            v-bind:src="item.preview_photos[1].urls.small"
                          />
                        </div>
                        <div class="thumbmain-2_inner">
                          <img
                            class="thumbimage"
                            v-bind:src="item.preview_photos[2].urls.small"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="textcontainer">
                    <div class="textmain">
                      {{ item.title }}
                    </div>
                  </div>
                </div>
              </a>
              <div>
                <button
                  v-on:click="setSelectCollection(item)"
                  class="btn selectbtn"
                >
                  Select this collection
                </button>
              </div>
            </div>
          </div>
          <!-- vue-infinite-loadingを使う場合 -->
          <!-- <infinite-loading
            ref="infiniteLoading"
            @infinite="infiniteHandler"
            spinner="waveDots"
          >
            <div slot="spinner">Loading...</div>
            <div slot="no-more">No more message</div>
            <div slot="no-results"></div>
          </infinite-loading> -->
          <div class="loadbtn">
            <!-- <button v-on:click="infiniteHandler" class="btn"> -->
            <button v-on:click="loadCollection()" class="btn">
              Load more collections
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import About from "./About";
// import InfiniteLoading from "vue-infinite-loading";
import "vue-select/dist/vue-select.css";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";

export default {
  name: "Modal",
  components: {
    About,
    // InfiniteLoading,
  },
  data() {
    return {
      page: 1,
      list: [],
      selectItemId: null,
      showModal: false,
      intervalTimeOptions: [
        { label: "Every 3 minutes", code: 180 },
        { label: "Every 5 minutes(default)", code: 300 },
        { label: "Every 15 minutes", code: 900 },
        { label: "Every 30 minutes", code: 1800 },
        { label: "Every 45 minutes", code: 2700 },
        { label: "Every hour", code: 3600 },
      ],
    };
  },
  mounted() {
    if (this.getSelectCollection.length !== 0) {
      this.selectItemId = this.getSelectCollection.id;
    }
    this.getCollectionAction();
  },
  computed: {
    ...mapState(["collections"]),
    ...mapGetters(["getSelectCollection"]),
  },
  methods: {
    ...mapActions(["getCollectionAction"]),
    ...mapMutations(["setUpdateIntervalTime"]),
    // vue-infinite-loadingを使う場合
    // infiniteHandler($state) {
    //   this.getCollectionAction($state);
    // },
    loadCollection: function () {
      this.getCollectionAction();
    },
    setIntervalSelected: function (value) {
      this.setUpdateIntervalTime(value.code);
    },
    confirm: function () {
      // this.$emit("getCollectionPhoto");
    },
    setSelectCollection: function (item) {
      this.selectItemId = item.id;
      this.$store.commit("setSelectCollection", item);
    },
    toggleClass: function () {
      this.showModal = !this.showModal;
    },
  },
};
</script>

<style lang="scss" scoped>
.overlay {
  background: rgba(255, 255, 255, 0.9);
  position: fixed;
  width: 100%;
  height: 100%;
  bottom: 0;
  z-index: 900;
  transition: all 0.5s ease;
  overflow-y: scroll;
}

.logo {
  position: absolute;
  left: 50px;
  & > img {
    background: rgba(255, 255, 255, 0.75);
    height: 50px;
  }
}

.panel {
  width: 100%;
  height: 100%;
  position: relative;
  top: 60px;
  transition: all 0.3s ease;
}

.modal-enter,
.modal-leave-active {
  opacity: 0;
}

.modal-enter .panel,
.modal-leave-active .panel {
  top: -200px;
}

a {
  text-decoration: none;
  color: #767676;
  transition: color 0.1s ease-in-out, opacity 0.1s ease-in-out;
  -webkit-text-decoration-skip: ink;
  text-decoration-skip-ink: auto;
  cursor: pointer;
}

button {
  cursor: pointer;
}

.globalcontainer {
  padding-left: 12px;
  padding-right: 12px;
  margin-left: auto;
  margin-right: auto;
}
@media (min-width: 768px) {
  .globalcontainer {
    max-width: 1320px;
  }
}

.container {
  display: grid;
  grid-gap: 48px 24px;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
}
@media (max-width: 767px) {
  .container {
    --columns: 1;
  }
}
@media (min-width: 768px) {
  .container {
    --columns: 2;
  }
}
@media (min-width: 768px) and (min-width: 992px) {
  .container {
    --columns: 3;
  }
}

.updateInterval {
  padding-bottom: 20px;
  width: 50vw;
}

.item {
  max-width: 416px;
}

.itemcontainer {
  &:hover {
    color: #111;
    opacity: 0.85;
  }
}

.thumbcontainer {
  position: relative;
  padding-bottom: 70%;
  margin-bottom: 16px;
}

.thumbmain {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  border-radius: 6px;
  perspective: 1px;
  overflow: hidden;
  transition: all 0.1s ease-in-out;
  &-1 {
    width: 70%;
    background: #f5f5f5;
    position: relative;
  }
  &-2 {
    display: flex;
    flex-direction: column;
    width: 30%;
    margin-left: 2px;
    &_inner {
      flex-grow: 1;
      position: relative;
      &:first-child {
        margin-bottom: 2px;
      }
    }
  }
}

.thumbimage {
  object-fit: cover;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
}

.textcontainer {
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.textmain {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.34;
  color: #111;
}

.selecteditem {
  padding: 0.25rem;
  border: 0.2rem solid #0070c9;
  border-radius: 6px;
}

.loadbtn {
  display: flex;
  justify-content: center;
  padding-top: 70px;
  padding-bottom: 70px;
}

.btn {
  color: #767676;
  background-color: #fff;
  height: 44px;
  padding: 0 16px;
  font-size: 15px;
  line-height: 42px;
  box-shadow: 0 1px 1px rgb(0 0 0 / 4%);
  white-space: nowrap;
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  transition: all 0.1s ease-in-out;
  text-align: center;
  &:hover {
    color: #111;
    border-color: #111;
    box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
  }
}

.selectbtn {
  height: 32px;
  padding: 0 11px;
  font-size: 14px;
  line-height: 30px;
}

.header-basic {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  top: 0px;
  right: 0px;
  background: rgba(255, 255, 255, 0.9);
  height: 50px;
  width: 100vw;
}

.header-basic ul {
  padding: 0;
  list-style: none;
  text-align: center;
  font-size: 1rem;
  line-height: 1.6;
  color: #767676;
}

.header-basic li {
  padding: 0 10px;
}

.header-basic ul a {
  color: inherit;
  text-decoration: none;
  opacity: 0.8;
}

.header-basic ul a:hover {
  opacity: 1;
}

.header-basic .social {
  text-align: center;
}

.header-basic .social > a {
  font-size: 24px;
  width: 40px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  text-align: center;
  border-radius: 50%;
  border: 1px solid #ccc;
  margin: 0 8px;
  color: inherit;
  opacity: 0.75;
}

.header-basic .social > a:hover {
  opacity: 0.9;
}

.header-basic .copyright {
  font-size: 13px;
  color: #aaa;
  margin-right: 10px;
}
</style>