<template>
  <div
    v-bind:style="[styleObject, styleImageObject]"
    class="clock"
    v-on:mouseover="mouseOverAction"
    v-on:mouseleave="mouseLeaveAction"
  >
    <div
      v-on:click="toggleClass"
      class="openbtn"
      v-bind:class="{ active: showModal }"
      v-show="hoverFlag"
    >
      <span></span><span></span><span></span>
    </div>
    <div class="aboutphoto" v-show="hoverFlag" v-if="!errored">
      <div class="aboutphoto_photo">
        <a
          v-bind:href="
            'https://unsplash.com/@' +
            displayPhotoData.user.username +
            '?utm_source=wallclock&utm_medium=referral'
          "
          target="_blank"
          rel="noopener noreferrer"
        >
          Photo
        </a>
        by
      </div>
      <div class="aboutphoto_profile">
        <img
          v-bind:src="displayPhotoData.user.profile_image.small"
          v-bind:alt="'Go to ' + displayPhotoData.user.name + '\'s profile'"
          class="aboutphoto_userimg"
        />
        <div class="aboutphoto_user">
          <a
            v-bind:href="
              'https://unsplash.com/@' +
              displayPhotoData.user.username +
              '?utm_source=wallclock&utm_medium=referral'
            "
            target="_blank"
            rel="noopener noreferrer"
            class="aboutphoto_username"
          >
            {{ displayPhotoData.user.name }}
          </a>
          <a
            v-bind:href="
              'https://unsplash.com/@' +
              displayPhotoData.user.username +
              '?utm_source=wallclock&utm_medium=referral'
            "
            target="_blank"
            rel="noopener noreferrer"
            class="aboutphoto_userlink"
          >
            @{{ displayPhotoData.user.username }}
          </a>
        </div>
        &nbsp;on&nbsp;
        <a
          href="https://unsplash.com/?utm_source=wallclock&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
        >
          Unsplash
        </a>
      </div>
    </div>
    <Modal
      v-on:close="toggleClass"
      v-on:getCollectionPhoto="getCollectionPhoto"
      v-show="showModal"
    ></Modal>
    <div class="clock_outer">
      <div class="clock_inner">
        <div class="clock_date">
          <div class="clock_date_inner">
            {{ DisplayDayOfWeek }}
          </div>
          <div class="clock_date_inner">
            {{ DisplayDay }}
          </div>
          <div class="clock_date_inner">
            {{ DisplayMonth }}
          </div>
        </div>
      </div>
      <div class="clock_inner">
        <div class="clock_time">
          <div class="clock_time_inner">
            {{ DisplayHours }}
          </div>
          <span class="clock_time_inner-colon">:</span>
          <div class="clock_time_inner">
            {{ DisplayMinutes }}
          </div>
          <span class="clock_time_inner-colon">:</span>
          <div class="clock_time_inner">
            {{ DisplaySeconds }}
          </div>
          <div class="clock_time_inner-ampm">
            {{ DisplayMeridian }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from "./Modal.vue";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Main",
  props: {},
  components: {
    Modal,
  },
  data() {
    return {
      errored: false,
      loading: true,
      showModal: false,
      hoverFlag: true,
      page: 1,
      collectionList: [],
      displayPhotoData: [],
      photoUrl: "",
      styleObject: {},
      styleImageObject: {},
      updatePhotoTimer: null,
      DisplayYear: 0,
      DisplayMonth: 0,
      DisplayDay: 0,
      DisplayHours: 0,
      DisplayMinutes: 0,
      DisplaySeconds: 0,
      DisplayMeridian: "",
      DisplayDayOfWeek: "",
    };
  },
  watch: {
    photoUrl: function () {
      this.styleImageObject = {
        backgroundImage: "url(" + this.photoUrl + ")",
      };
    },
    getSelectCollection: function () {
      window.clearTimeout(this.updatePhotoTimer);
      this.updatePhoto();
    },
    getUpdateIntervalTime: function () {
      window.clearTimeout(this.updatePhotoTimer);
      this.updatePhotoTimer = setTimeout(
        this.updatePhoto,
        this.updateIntervalTime * 1000
      );
    },
  },
  created() {},
  computed: {
    ...mapState(["selectCollection", "updateIntervalTime"]),
    ...mapGetters(["getSelectCollection", "getUpdateIntervalTime"]),
  },
  mounted() {
    this.setTime();
    this.updatePhoto();
  },
  filters: {},
  destroyed: function () {
    window.clearTimeout(this.updatePhotoTimer);
  },
  methods: {
    setTime: function () {
      setInterval(
        function () {
          this.DisplayYear = this.$moment().format("YYYY");
          this.DisplayMonth = this.$moment().format("MMMM");
          this.DisplayDay = this.$moment().format("Do");
          this.DisplayHours = this.$moment().format("hh");
          this.DisplayMinutes = this.$moment().format("mm");
          this.DisplaySeconds = this.$moment().format("ss");
          this.DisplayMeridian = this.$moment().format("a");
          this.DisplayDayOfWeek = this.$moment().format("dddd");
        }.bind(this),
        1000
      );
    },
    toggleClass: function () {
      this.showModal = !this.showModal;
    },
    mouseOverAction: function () {
      this.hoverFlag = true;
    },
    mouseLeaveAction: function () {
      this.hoverFlag = true;
    },
    updatePhoto: function () {
      if (Object.keys(this.selectCollection).length) {
        this.getCollectionPhoto();
      } else {
        this.getRandomPhoto();
      }
      this.updatePhotoTimer = setTimeout(
        this.updatePhoto,
        this.updateIntervalTime * 1000
      );
    },
    // ランダムに取得
    getRandomPhoto: function () {
      this.$axios
        .get(process.env.VUE_APP_UNSPLASH_API + "photos/random", {
          headers: {
            Authorization: "Client-ID " + process.env.VUE_APP_ACCESS_KEY,
          },
          params: {
            topics: "wallpapers",
            orientation: "landscape",
          },
        })
        .then((response) => {
          this.displayPhotoData = response.data;
          this.trackdownload(this.displayPhotoData);
          this.photoUrl = this.displayPhotoData.urls.full;
        })
        .catch((error) => {
          console.log(error);
          this.errored = true;
          this.photoUrl = "https://source.unsplash.com/random";
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 選択されたコレクションから取得
    getCollectionPhoto: function () {
      this.$axios
        .get(
          process.env.VUE_APP_UNSPLASH_API +
            "collections/" +
            this.selectCollection.id +
            "/photos",
          {
            headers: {
              Authorization: "Client-ID " + process.env.VUE_APP_ACCESS_KEY,
            },
            params: {
              // topics: "wallpapers",
              // orientation: "landscape",
              // total_photosからpageをランダムに
              // per_pageを1にすることでランダムに1つを取得
              page: Math.floor(
                Math.random() * this.selectCollection.total_photos
              ),
              per_page: 1,
            },
          }
        )
        .then((response) => {
          if (response.data[0].width < response.data[0].height) {
            this.getCollectionPhoto();
          } else {
            this.displayPhotoData = response.data[0];
            this.trackdownload(this.displayPhotoData);
            this.photoUrl = this.displayPhotoData.urls.full;
          }
        })
        .catch((error) => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    trackdownload: function (data) {
      this.$axios
        .get(data.links.download_location, {
          headers: {
            Authorization: "Client-ID " + process.env.VUE_APP_ACCESS_KEY,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {});
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
a {
  text-decoration: none;
  color: #767676;
  transition: color 0.1s ease-in-out, opacity 0.1s ease-in-out;
  -webkit-text-decoration-skip: ink;
  text-decoration-skip-ink: auto;
  cursor: pointer;
}

.aboutphoto {
  backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 0.5);
  margin-top: 0.3rem;
  border-radius: 18px;
  box-shadow: 2px 4px 12px rgb(0 0 0 / 50%);
  padding-left: 1rem;
  padding-right: 1rem;
  position: absolute;
  top: 0px;
  right: 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  &_profile {
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
  }
  &_userimg {
    -webkit-clip-path: circle(45% at 50% 50%);
    clip-path: circle(45% at 50% 50%);
  }
  &_user {
    display: flex;
    flex-direction: column;
  }
  &_username {
    color: inherit;
    font-size: 13px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &_userlink {
    font-size: 11px;
    letter-spacing: 0.02em;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.clock {
  display: flex;
  height: 100vh;
  min-height: -webkit-fill-available;
  width: auto;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.clock_outer {
  // height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  // gap: 0.3rem;
}

.clock_inner {
  backdrop-filter: blur(5px);
  background-color: rgba($color: #ffffff, $alpha: 0.5);
  // padding: 2rem;
  text-align: center;
  width: 35vw;
  margin-top: 0.3rem;
  border-radius: 18px;
  box-shadow: 2px 4px 12px rgb(0 0 0 / 8%);
}

.clock_date {
  display: flex;
  justify-content: flex-end;
  text-transform: uppercase;
  &_inner {
    font-size: 2.2vw;
    padding-right: 1.2vw;
  }
}

.clock_time {
  display: flex;
  justify-content: center;

  &_inner {
    width: 9vw;
    // background-color: rgba($color: #ffffff, $alpha: 0.5);
    font-size: 7vw;
    margin: auto;
    &-colon {
      font-size: 7vw;
      margin-top: -0.5rem;
      margin-bottom: 0.5rem;
    }
    &-ampm {
      align-self: flex-end;
      font-size: 2vw;
      margin-bottom: 2vh;
      margin-right: 0.8vw;
      text-transform: uppercase;
    }
  }
}

.openbtn {
  position: relative; /*ボタン内側の基点となるためrelativeを指定*/
  width: 50px;
  height: 50px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.75);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

/*ボタン内側*/
.openbtn span {
  display: inline-block;
  transition: all 0.4s; /*アニメーションの設定*/
  position: absolute;
  left: 13px;
  height: 2px;
  background-color: #666;
}

.openbtn span:nth-of-type(1) {
  top: 22px;
  width: 50%;
}

.openbtn span:nth-of-type(2) {
  top: 29px;
  width: 30%;
}

/*activeクラスが付与されると線が回転して×に*/
.openbtn.active span:nth-of-type(1) {
  top: 20px;
  left: 16px;
  transform: translateY(6px) rotate(-45deg);
  width: 35%;
}

.openbtn.active span:nth-of-type(2) {
  top: 32px;
  left: 16px;
  transform: translateY(-6px) rotate(45deg);
  width: 35%;
}
</style>
