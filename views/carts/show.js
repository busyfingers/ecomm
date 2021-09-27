const layout = require('../layout');

module.exports = ({ items }) => {
  const totalPrice = items.reduce(
    (tot, cur) => tot + cur.product.price * cur.quantity,
    0.0
  );
  const renderedItems = items
    .map(item => {
      return `
        <div class="cart-item message">
          <h3 class="subtitle">${item.product.title}</h3>
          <div class="cart-right">
            <div class="increase" style="margin-right: 10px;">
              <form method="POST" action="/cart/products/edit">
                <input hidden name="itemId" value="${item.id}" />
                <input hidden name="quantity" value="${item.quantity + 1}" />
                <button class="button is-info">                  
                  <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                </button>
              </form>
            </div>
            <div class="decrease" style="margin-right: 10px;">
              <form method="POST" action="/cart/products/edit">
                <input hidden name="itemId" value="${item.id}" />
                <input hidden name="quantity" value="${item.quantity - 1}" />
                <button class="button is-info">                  
                  <span class="icon is-small">
                    <i class="fas fa-minus"></i>
                  </span>
                </button>
              </form>
            </div>
            <div>
              $${item.product.price}  X  ${item.quantity} = 
            </div>
            <div class="price is-size-4">
              $${item.product.price * item.quantity}
            </div>
            <div class="remove">
              <form method="POST" action="/cart/products/delete">
                <input hidden name="itemId" value="${item.id}" />
                <button class="button is-danger">                  
                  <span class="icon is-small">
                    <i class="fas fa-times"></i>
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return layout({
    content: `
      <div id="cart" class="container">
        <div class="columns">
          <div class="column"></div>
          <div class="column is-four-fifths">
            <h3 class="subtitle"><b>Shopping Cart</b></h3>
            <div>
              ${renderedItems}
            </div>
            <div class="total message is-info">
              <div class="message-header">
                Total
              </div>
              <h1 class="title">$${totalPrice}</h1>
              <button class="button is-primary">Buy</button>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
    `
  });
};
