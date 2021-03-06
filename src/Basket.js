import axios from 'axios';
import React from 'react';
require('dotenv').config();

function Basket(props) {
    const {cartItems,onAdd,onRemove} = props;


//razorpay payment
    const loadScript = (src) => {
        return new Promise(res => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                res(true);
            };
            script.onerror = () => {
                res(false);
            }
            document.body.appendChild(script);
        })
    };

    const displayRazorpay = async () => {
        try {
            const res = loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if(!res){
                alert("network error");
                return;
            }
            const {data } = await axios.post("https://equippment-hiring.herokuapp.com/payment/orders");
            if(!data){
                alert("network error");
                return;
            }
            const {amount,id:order_id,currency} = data;
            const options = {
                key : process.env.RAZORPAY_KEY,
                amount : amount.toString(),
                currency,
                name:"something",
                description:"some description about payment",
                image : "",
                order_id,
                handler: async function(response) {
                    const data = {
                        orderCreationId : order_id,
                        razorpayPaymentId : response.razorpay_payment_id,
                        razorpayOrderId : response.razorpay_order_id,
                        razorpaySignature : response.razorpay_signature,
                        amount : amount.toString(),
                        currency
                    }
                    const result = await axios.post("https://equippment-hiring.herokuapp.com/payment/success",data);
                    console.log(result.data);
                },
                prefill : {
                    name : "name",
                    email : "name@gmail.com",
                    contact : '1234567890'
                }
            }
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.log(error.message);
        }
    }



    //console.log(cartItems)
    const qty = cartItems.map((e) => e.qty )
    console.log(qty)
    const itemsPrice = cartItems.reduce((a,c) => a + c.price * c.qty , 0);
     const taxPrice = itemsPrice * 0.14;
    const totalPrice = itemsPrice + taxPrice;
    return (
       <aside className="block col-1">
       <h2>Cart Items</h2>
       {/* <div>{cartItems.length === 0 && <div>Cart Is Empty</div> }</div> */}
       <div>{cartItems.length === 0 ? <div>Cart Is Empty</div> : null }</div>
       {cartItems.map((item) => (
           
           <div key={item.id} className="row5">
           <div className="col-2">{item.name}</div>
           <div className="inc-dec">
               <button onClick={() => onAdd(item)} className="add">+</button>
               <button onClick={() => onRemove(item)} className="remove">-</button>
           </div>
           <div className="col-2 text-right">
              <span>item cost = </span> {item.qty} * Rs.{item.price.toFixed(2)}
           </div>
           </div>
           
       ))}
       {cartItems.length !==0 && (
           <>
           <hr />
           <div className='row8'>
           <div className='col-2'>Total Items Price</div>
           <div className='col-1 text-right'>Rs.{itemsPrice.toFixed(2)}</div>
           </div>
           <div className='row8'>
           <div className='col-2'>Tax Price</div>
           <div className='col-1 text-right'>Rs.{taxPrice.toFixed(2)}</div>
           </div>
           <div className='row8'>
           <div className='col-2'><strong>Total Price</strong></div>
           <div className='col-1 text-right'>Rs.{totalPrice.toFixed(2)}</div>
           </div>
           <hr/>
           <div >
               <button onClick={displayRazorpay}>check out</button>

           </div>
           </>
       )}
       </aside>
    )
}

export default Basket
