import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    page: 1,
    collections: [],
    selectCollection: [],
    updateIntervalTime: 300
  },
  getters: {
    getCollections: (state) => {
      return state.collections;
    },
    getSelectCollection: (state) => {
      return state.selectCollection;
    },
    getUpdateIntervalTime: (state) => {
      return state.updateIntervalTime;
    },
    getPage: (state) => {
      return state.page;
    }
  },
  mutations: {
    setCollections(state, item) {
      state.collections = item
    },
    setSelectCollection(state, item) {
      state.selectCollection = item
    },
    setUpdateIntervalTime(state, value) {
      state.updateIntervalTime = value
    },
    incrementPage(state) {
      state.page++
    },
    addCollections(state, data) {
      state.collections.push(...data);
    }
  },
  actions: {
    async getCollectionAction({
      commit,
      state
    }, ) {
      // }, loadState) {
      axios
        .get(process.env.VUE_APP_UNSPLASH_API + "collections", {
          headers: {
            Authorization: "Client-ID " + process.env.VUE_APP_ACCESS_KEY,
          },
          params: {
            page: state.page,
            per_page: "12",
          },
        })
        .then((response) => {
          if (response.data.length) {
            commit('incrementPage');
            commit('addCollections', response.data);
            // ボタンで追加するため一度コンプリートにする
            // loadState.loaded();
            // loadState.complete();
          }
          // else {
          //   loadState.complete();
          // }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {});
    }
  },
  modules: {}
})