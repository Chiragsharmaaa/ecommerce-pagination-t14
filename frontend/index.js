//since we use async in our script tag,  the script will load first and will find no html element
// to manipulate. so we check if the page is loading and add a ready function to the event listener
//
if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

var totalPages;

//default function that runs on page load or reload.
function ready() {
  // for removing the cart item on clicking remove btn
  const removeCartItemBtn = document.getElementsByClassName("btn-danger");
  for (let i = 0; i < removeCartItemBtn.length; i++) {
    let button = removeCartItemBtn[i];
    button.addEventListener("click", removeCartItem);
  }

  //event listener for changed quantity of cart Items.
  let quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (let i = 0; i < quantityInputs.length; i++) {
    let input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  // event listener for adding to cart
  // let addToCartButtons = document.getElementsByClassName("shop-item-button");
  // for (let i = 0; i < addToCartButtons.length; i++) {
  //   let button = addToCartButtons[i];
  //   button.addEventListener("click", addToCart);
  // }

  //event listener for purchase button
  document
    .getElementsByClassName("btn-purchase")[0]
    .addEventListener("click", purchaseClicked);
}

window.addEventListener("DOMContentLoaded", () => {
  var page = location.href.split("page=").slice(-1)[0] || 1;
  if (page.length > 3) {
    page = 1;
  }

  axios
    .get(`http://localhost:3000/products/?page=${page}`)
    .then((data) => {
      if (data.request.status === 200) {
        const products = data.data.products;
        totalPages = data.data.lastPage;

        const parentSection = document.getElementById("shop-items");
        products.forEach((product) => {
          const productHTML = `
        <div id="shop-item">
          <h3 class="shop-item-title">${product.title}</h3>
          <div class="image-container">
            <img class="prod-images" src="${product.imageUrl}"></img>
          </div>
          <div class="prod-details">
            <h1 class="shop-item-price">${product.price}</h1>
            <button onClick="addToCart(${product.id})" class="shop-item-button" type="button">ADD to Cart</button>
          </div>
          </div>
          `;
          parentSection.innerHTML += productHTML;
        });
      }
    })
    .then(() => {
      createPaginationButtons(totalPages);
    })
    .catch((err) => console.log(err));
});

// pagination code
// function for creating buttons for pagination.
function createPaginationButtons(totalPage) {
  const paginationContainer = document.getElementById("pagination");

  for (let i = 1; i <= totalPage; i++) {
    const buttonATag = `<a class=""paginationBtns id="paginationBtns" href="./store.html?page=${i}">${i}</a>`;
    paginationContainer.innerHTML += buttonATag;
  }
}

function addtToCartFunction() {
  const addtoCartBtn = document.getElementsByClassName("shop-item-button");

  for (var i = 0; i < addtoCartBtn.length; i++) {
    var btn = addtoCartBtn[i];
    btn.addEventListener("click", addToCart);
  };
};

function addToCart(productId) {

  axios
    .post("http://localhost:3000/cart", { productId: productId })
    .then((response) => {
      if (response.status === 200) {
        notifyUsers(response.data.message);
        getCartDetails()
      } else {
        throw new Error();
      }
      
    })
    .catch((err) => console.log(err));
}

function getcartforDisplay() {
  axios.get("http://localhost:3000/cart").then((response) => {
    if (response.status === 200) {
      response.data.products.forEach((product) => {
        let cartRow = document.createElement("div");
        cartRow.classList.add("cart-row");
        let cartItems = document.getElementsByClassName("cart-items")[0];
        let cartItemNames = cartItems.getElementsByClassName("cart-item-title");
        for (i = 0; i < cartItemNames.length; i++) {
          if (cartItemNames[i].innerText == product.title) {
            return;
          }
        }
        let cartRowContents = `
              <div class="cart-item cart-column">
                <img class="cart-item-image" src="${product.imageUrl}" width="100" height="100">
                <span class="cart-item-title">${product.title}</span>
              </div>
                <span class="cart-price cart-column">${product.price}</span>
              <div class="cart-quantity cart-column">
                <input class="cart-quantity-input" type="number" value="1">
                <button class="btn btn-danger" type="button">REMOVE</button>
              </div>`;
        cartRow.innerHTML = cartRowContents;
        cartItems.append(cartRow);
        updateCartTotal();
      });
    }
  });
}

function getCartDetails() {
  axios
    .get("http://localhost:3000/cart")
    .then((response) => {
      if (response.status === 200) {
        response.data.products.forEach((product) => {
          addItemToCart(product.title, product.price, product.imageUrl);
          updateCartTotal();
        });
        document.querySelector("#cart").style = "display: block;";
      } else {
        throw new Error("something went wrong");
      }
    })
    .catch((err) => console.log(err));
}

//for displaying cart on click
const parentContainer = document.getElementById("EcommerceContainer");
parentContainer.addEventListener("click", (e) => {
  if (
    e.target.className == "cart-btn-bottom" ||
    e.target.className == "cart-bottom" ||
    e.target.className == "cart-holder"
  ) {
    document.querySelector("#cart").style = "display: block;";
    getcartforDisplay(); //whenever button is clicked the function returns response.
  }
  if (e.target.className == "cancel") {
    document.querySelector("#cart").style = "display: none;";
  }
});

function addItemToCart(title, price, imageSrc) {
  let cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  let cartItems = document.getElementsByClassName("cart-items")[0];
  let cartItemNames = cartItems.getElementsByClassName("cart-item-title");
  for (i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("Already added to cart");
      return;
    }
  }
  let cartRowContents = `
  <div class="cart-item cart-column">
    <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
    <span class="cart-item-title">${title}</span>
  </div>
    <span class="cart-price cart-column">${price}</span>
  <div class="cart-quantity cart-column">
    <input class="cart-quantity-input" type="number" value="1">
    <button class="btn btn-danger" type="button">REMOVE</button>
  </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
  updateCartTotal();
  //event listeners when a product is added post page load.
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);
}

function notifyUsers(message) {
  const container = document.getElementById("container");
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerHTML = `<h4>${message}</h4>`;
  container.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// All other functions...

function removeCartItem(e) {
  axios.delete('http://localhost:3000/delete-product', {product})
  let parentDiv = e.target.parentElement.parentElement;
  parentDiv.remove();
  updateCartTotal();
}

function quantityChanged(e) {
  let input = e.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function purchaseClicked() {
  let cartItems = document.getElementsByClassName("cart-items")[0];
  while (cartItems.hasChildNodes()) {
    cartItems.removeChild(cartItems.firstChild);
  }
  if (cartItems.childElementCount === 0) {
    alert("Empty Cart!");
  } else {
    alert("ThankYou! Visit Again!");
  }
  updateCartTotal();
}

//updating total of Cart on adding or removing items.
function updateCartTotal() {
  var total = 0;
  let cartItemContainer = document.getElementsByClassName("cart-items")[0];
  let cartRows = cartItemContainer.getElementsByClassName("cart-row");
  for (let i = 0; i < cartRows.length; i++) {
    let cartRow = cartRows[i];
    let cartPrice = cartRow.getElementsByClassName("cart-price")[0];
    let cartQuantity = cartRow.getElementsByClassName("cart-quantity-input")[0];
    var price = parseFloat(cartPrice.innerText.replace("$", ""));
    var quantity = cartQuantity.value;
    total = total + price * quantity;
  }
  total = Math.round(total * 100) / 100; //to round upto 2 digits after decimal
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + total;
}
