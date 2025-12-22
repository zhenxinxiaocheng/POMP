<template>
  <div :class="headClass">
    <div :class="program + 'header-title'">
    </div>
    <div :class="program + 'header-main'">
      <div class="left">
        <Search />
      </div>
      <div class="right">
        <div class="item">
          <b-poptip
            max-length="180px"
            placement="bottom-start"
            :theme="getTheme"
          >
            <b-button
              :class="[
                `iconfont icon-icon-huanfu`,
                `${theme + '-huanfu-icon'}`,
              ]"
              width="50px"
              height="30px"
              type="text"
              transparent
            />
            <div slot="title" class="poptip-title">主题</div>
            <div class="huanfu" slot="content">
              <div class="theme-item" @click="handleThemeLight">优雅白</div>
              <div class="theme-item" @click="handleThemeDark">炫酷黑</div>
              <div class="theme-item" @click="handleThemeGreen">清新绿</div>
            </div>
          </b-poptip>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { theme } from "mixin/global/theme.js";
import Login from "content/user/Login";
import Search from "content/search";
export default {
  name: "LayoutHeader",
  mixins: [theme],
  components: { Login, Search },
  data() {
    return {
      isShow: false,
      isLogin: false,
    };
  },
  computed: {
    headClass() {
      return [`${this.program + this.theme + "-header"}`, "dance-music-header"];
    },
    getAvatar() {
      return this.$store.getters.getAvatar;
    },
  },
  methods: {
    /**主题 */
    handleThemeLight() {
      this.$store.commit("setTheme", "light");
    },
    handleThemeDark() {
      this.$store.commit("setTheme", "dark");
    },
    handleThemeGreen() {
      this.$store.commit("setTheme", "green");
    },
    handleAvatarClick() {
      this.isLogin = true;
    },
    hiddleLogin() {
      this.isLogin = false;
    },
  },
};
</script>
<style lang="less" scoped>
.dance-music-header {
  display: flex;
  align-items: center;
  height: 58px;
  width: 100%;
  &-title {
    width: 10%;
    height: 100%;
    text-align: center;
    display: flex;
  }
  &-main {
    width: 90%;
    height: 100%;
    display: flex;
    .left {
      flex: 1;
      text-align: center;
      line-height: 58px;
      ::v-deep .vbestui-bubble {
        padding: 0px;
      }
    }
    .right {
      flex: 2;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .item {
        margin-right: 120px;
      }
      .avatar {
        //调整位置
        margin-right: 60px;
        cursor: pointer;
      }
      a {
        text-decoration: none;
      }
      .item {
        width: 60px;
        text-align: center;
        font-size: 22px;
      }
      .iconfont {
        font-size: 24px;
      }
      .poptip-title {
        font-size: 16px;
        text-align: left;
      }
      .huanfu {
        display: flex;
        height: 60px;
        width: 100%;
        cursor: pointer;
        .theme-item {
          flex: 1px;
          line-height: 60px;
          text-align: center;
          font-size: 13px;
        }
        .theme-item:nth-child(1) {
          background: var(--light-bg-color);
          color: var(--dark-bg-color);
        }
        .theme-item:nth-child(2) {
          background: #292c32;
          color: #fff;
        }
        .theme-item:nth-child(3) {
          background: #449e60;
        }
      }
    }
  }
}
.iconfont {
  font-size: 12px;
}
.header-side-enter-active {
  animation: slideInDown 0.4s;
}
.header-side-leave-active {
  animation: slideInDown 0.4s reverse;
}
// light主题
.dance-music-light-header {
  background: var(--light-bg-color);
}
// dark主题
.dance-music-dark-header {
  background: var(--dark-header-bg-color);
}
//green主题
.dance-music-green-header {
  background: var(--green-bg-color);
}
// 换肤图标主题
.light-huanfu-icon {
  color: var(--dark-bg-color) !important;
}
.dark-huanfu-icon {
  color: #ccc !important;
}
// header 右边图标主题
.light-item {
  color: var(--light-text-color);
}
.dark-item {
  color: #ccc;
}
.green-item {
  color: #f6f6f6;
}
// header 左边图标主题
.header-dark-title-icon {
  color: #ccc;
}
.header-green-title-icon {
  color: #f6f6f6;
}
.login {
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  margin: auto;
}
.login-enter-active {
  animation: fadeInDown var(--animation-base-time);
}
.login-leave-active {
  animation: zoomOutUp var(--animation-base-time);
}
</style>