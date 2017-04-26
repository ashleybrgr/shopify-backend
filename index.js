'use strict';

const _       = require('lodash');
const request = require('request-promise');
const Promise = require('bluebird');
const url     = 'https://backend-challenge-fall-2017.herokuapp.com/'

let availableCookies;
let orders = [];

return fetchOrders(1)
.then(() => {
  orders = _.flatten(orders);
  let wCookies = _.filter(orders, order =>  {
    let toAdd = _.some(order.products, {'title': 'Cookie'}) && !order.fulfilled;
    if (!toAdd && !order.fulfilled) { order.fulfilled = true; }
    return toAdd;
  })

  let sorted = _.orderBy(wCookies, [order => {
    return _.find(order.products, {'title' : 'Cookie'}).amount;
  }, 'id'], ['desc', 'asc'])

  let unfulfilledIds = _.map(sorted, order => {
    let amount = _.find(order.products, {'title' : 'Cookie'}).amount;
    if (amount > availableCookies) { return order.id; }
    availableCookies = availableCookies - amount;
    orders[order.id-1].fulfilled = true;
  }).filter(id => id);

  let output = {
    'remaining_cookies': availableCookies,
    'unfulfilled_orders': unfulfilledIds
  }
  console.log(output);
})
.catch(err => {
  console.log(err);
})


function fetchOrders(currentPage) {
  return getOrders({ 'page': currentPage })
  .then(response => {
    availableCookies = response.available_cookies;
    orders.push(response.orders);

    if (currentPage < response.pagination.total) {
      return fetchOrders(++currentPage);
    }
    return Promise.resolve();
  })
  .catch(err => {
    return Promise.reject(err);
  })
}

function getOrders(query) {
  var options = {
    url:  url + 'orders.json',
    method: 'GET',
    qs: query,
    json: true
  }
  return request(options);
}