<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">后台管理登录</h3>
      </div>

      <el-form-item prop="signinInput">

        <el-input
          ref="signinInput"
          v-model="loginForm.signinInput"
          placeholder="邮箱"
          name="email"
          type="text"
          tabindex="1"
          autocomplete="on"
        >
          <i
            slot="prefix"
            class="el-icon-user el-input__icon"
          /></el-input>
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="注意! 大写锁定已打开" placement="right" manual>
        <el-form-item prop="password">
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          ><i
             slot="prefix"
             class="el-icon-lock el-input__icon"
           />
            <i slot="suffix" class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </i></el-input>
        </el-form-item>
      </el-tooltip>
      <el-form-item prop="validate">
        <el-input ref="validate" v-model="loginForm.validate" class="validate-code class-el-input" placeholder="验证码" />
        <div class="code">
          <img
            height="40px"
            :src="imageBase64"
            alt="获取验证码"
            @click="getCaptcha"
          >
        </div>
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>
    </el-form>
    <div class="footer">
      <div class="links">
        <a
          href="http://doc.henrongyi.top/"
        ><img
          src="@/assets/docs.png"
          class="link-icon"
        ></a>
        <a
          href="https://www.yuque.com/flipped-aurora/"
        ><img
          src="@/assets/yuque.png"
          class="link-icon"
        ></a>
        <a
          href="https://github.com/flipped-aurora/gin-vue-admin"
        ><img
          src="@/assets/github.png"
          class="link-icon"
        ></a>
      </div>
      <div class="copyright">
        Copyright &copy; {{ curYear }} Prisoncode
      </div>
    </div>
  </div>
</template>

<script>
import { validEmail } from '@/utils/validate'
import { getUUID } from '@/utils/tool'
import { getCaptchaCode } from '@/api/userAction'

export default {
  name: 'Login',
  components: { },
  data() {
    const validateEmail = (rule, value, callback) => {
      console.log(value, validEmail(value))
      if (!validEmail(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('请输入正确的密码'))
      } else {
        callback()
      }
    }
    const validateCaptcherCode = (rule, value, callback) => {
      if (value.length !== 4) {
        callback(new Error('请输入正确的验证码'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        signinInput: '',
        password: '',
        validate: ''
      },
      loginRules: {
        signinInput: [{ required: true, trigger: 'blur', validator: validateEmail }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        validate: [{ required: true, trigger: 'blur', validator: validateCaptcherCode }]
      },
      listQuery: {
        uid: '',
        type: 1
      },
      imageBase64: undefined,
      newUID: '',
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
    this.getCaptcha()
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    getCaptcha() {
      const uid = getUUID()
      this.listQuery.uid = uid
      getCaptchaCode(this.listQuery).then(response => {
        if (response.status === 2000) {
          this.imageBase64 = response.data.data
          this.newUID = response.data.uid
        }
        // console.log(response.data.status)
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const loginData = {
            loginType: 'email',
            signinInput: this.loginForm.signinInput,
            password: this.loginForm.password,
            uid: this.newUID,
            verifyCode: this.loginForm.validate

          }
          this.$store.dispatch('user/login', loginData)
            .then(() => {
              this.$router.replace({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#595f66;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  // .login-container .el-input input {
  //   color: $cursor;
  // }
}

/* reset element-ui css */
.login-container {
    background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
  .footer {
      position: relative;
      width: 100%;
      padding: 0 20px;
      margin: 40px 0 10px;
      text-align: center;
      .links {
        margin-bottom: 8px;
        font-size: 14px;
        width: 330px;
        display: inline-flex;
        flex-direction: row;
        justify-content: space-between;
        padding-right: 40px;
        a {
          color: rgba(0, 0, 0, 0.45);
          transition: all 0.3s;
        }
      }
      .copyright {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        padding-right: 40px;
      }
    }
    .link-icon {
        width: 25px;
        min-width: 25px;
        height: 25px;
        border-radius: 10px;
    }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 420px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 3px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
  .code {
  width: 112px;
  float: right;
  border-radius: 2px;
}
.validate-code {
  width: 60%;
  height: 50px;
  float: left;
}
}

</style>
