const layout = require('../layout');

module.exports = () => {
  return layout({
    content: `
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-half">
            <h1 class="title has-text-centered">You are now signed out</h1>
            <div class="has-text-centered"><a href="/signup">Back to login</a></div>
          </div>
        </div>
      </div>
    `
  });
};
