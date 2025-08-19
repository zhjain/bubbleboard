export default () => ({
  username: localStorage.getItem('username') || '匿名',
  showEditUser: false,
  newUsername: '',

  // 点击模态框的“保存”按钮
  handleSave() {
    let newUsername = this.newUsername.trim();
    if (newUsername) {
      this.$store.channel.chan
        .push('user:edit', { username: newUsername })
        .receive('ok', (resp) => {
          console.log('Username updated successfully', resp);
          localStorage.setItem('username', newUsername);
          this.username = newUsername;
          this.newUsername = '';
          this.showEditUser = false;
        })
        .receive('error', (resp) => {
          console.log('Failed to update username', resp);
        });
    }
  },

  handleShowEditUser() {
    this.showEditUser = true;
    this.newUsername = this.username; // 初始化输入框为当前用户名
    this.$nextTick(() => {
      const input = this.$refs.usernameInput;
      // 聚焦输入框
      if (input) {
        input.focus();
        input.select();
      }
    });
  },

  hideEditUser(e, that) {
    if (e.target === that) {
      this.showEditUser = false;
    }
  },

  handleClearUsername() {
    this.$store.channel.chan.push('user:edit', { username: '匿名' }).receive('ok', (resp) => {
      console.log('Username updated successfully', resp);
      this.username = '匿名';
      localStorage.removeItem('username');
    });
  },
});
