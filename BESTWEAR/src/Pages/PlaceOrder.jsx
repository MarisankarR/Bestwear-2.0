import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../Components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../Context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');

  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  })

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setFormData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {

    event.preventDefault()

    try {

      let orderItems = []

      for (const items in cartItems) {
        for (const item in cartItems[items]) {

          if (cartItems[items][item] > 0) {

            const itemInfo = structuredClone(
              products.find(product => product._id === items)
            )

            if (itemInfo) {
              itemInfo.size = item
              itemInfo.quantity = cartItems[items][item]
              orderItems.push(itemInfo)
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        paymentMethod: method
      }

      switch (method) {

        // COD
        case 'cod':

          const response = await axios.post(
            backendUrl + '/api/order/cod',
            orderData,
            { headers: { token } }
          )

          if (response.data.success) {
            setCartItems({})
            navigate('/orders')
          } else {
            toast.error(response.data.message)
          }

          break


        // Stripe
        case 'stripe':

          const responseStripe = await axios.post(
            backendUrl + '/api/order/stripe',
            orderData,
            { headers: { token } }
          )

          if (responseStripe.data.success) {

            const { session_url } = responseStripe.data
            window.location.replace(session_url)

          } else {
            toast.error(responseStripe.data.message)
          }

          break


        // Google Pay
        case 'google':

          const responseGoogle = await axios.post(
            backendUrl + '/api/order/google',
            orderData,
            { headers: { token } }
          )

          if (responseGoogle.data.success) {

            const { session_url } = responseGoogle.data
            window.location.replace(session_url)

          } else {
            toast.error(responseGoogle.data.message)
          }

          break


        // Razorpay (not implemented)
        case 'razorpay':
          toast.info("Razorpay integration coming soon")
          break


        // Net Banking (not implemented)
        case 'netbanking':
          toast.info("Net Banking integration coming soon")
          break


        default:
          toast.error("Select a payment method")

      }

    } catch (error) {

      console.log(error)
      toast.error(error.message)

    }

  }

  const handleSave = () => {
    console.log('Saved delivery info:', formData)
    setIsSaved(true)
  }

  return (

    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>

      {/* LEFT SIDE */}

      <div className='w-full sm:max-w-[480px] mx-auto'>

        {isSaved && (
          <div className='mb-6 shadow-2xl shadow-purple-600'>
            <div className='text-xl sm:text-2xl font-bold mb-2'>YOUR INFORMATION</div>

            <div className='border border-gray-300 rounded p-4 bg-gray-50 text-sm space-y-2'>
              <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
              <div><strong>Email:</strong> {formData.email}</div>
              <div><strong>Street:</strong> {formData.street}</div>
              <div><strong>City:</strong> {formData.city}</div>
              <div><strong>State:</strong> {formData.state}</div>
              <div><strong>Zipcode:</strong> {formData.zipcode}</div>
              <div><strong>Country:</strong> {formData.country}</div>
              <div><strong>Phone:</strong> {formData.phone}</div>
            </div>
          </div>
        )}

        {!isSaved && (

          <div className='flex flex-col gap-4 shadow-2xl shadow-purple-600 px-5 py-5 rounded-xl'>

            <div className='text-xl sm:text-2xl my-3'>
              <Title text1='DELIVERY' text2='INFORMATION' />
            </div>

            <div className='flex gap-3'>
              <input required name='firstName' value={formData.firstName} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='First name' />
              <input required name='lastName' value={formData.lastName} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Last name' />
            </div>

            <input required name='email' value={formData.email} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='email' placeholder='Email address' />

            <input required name='street' value={formData.street} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Street' />

            <div className='flex gap-3'>
              <input required name='city' value={formData.city} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='City' />
              <input required name='state' value={formData.state} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='State' />
            </div>

            <div className='flex gap-3'>
              <input required name='zipcode' value={formData.zipcode} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Zipcode' />
              <input required name='country' value={formData.country} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Country' />
            </div>

            <input required name='phone' value={formData.phone} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Phone' />

            <button type="button" onClick={handleSave} className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700'>
              Save
            </button>

          </div>

        )}

      </div>


      {/* RIGHT SIDE */}

      <div className='mt-8'>

        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-12 py-5 px-5 rounded-lg shadow-2xl shadow-purple-600'>

          <Title text1={'PAYMENT'} text2={'METHOD'} />

          <div className='flex gap-4 flex-col lg:flex-row'>

            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border border-gray-400 rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
            </div>

            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border border-gray-400 rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
            </div>

            <div onClick={() => setMethod('google')} className='flex items-center gap-3 p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border border-gray-400 rounded-full ${method === 'google' ? 'bg-green-400' : ''}`}></p>
              <img className='h-11 w-12 mx-4' src={assets.google_pay} alt="" />
            </div>

            <div onClick={() => setMethod('netbanking')} className='flex items-center gap-3 p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border border-gray-400 rounded-full ${method === 'netbanking' ? 'bg-green-400' : ''}`}></p>
              <h1>Net Banking</h1>
            </div>

            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border border-gray-400 rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>

          </div>

          <div className='w-full text-end mt-8 pt-5'>
            <button type='submit' className='bg-black text-white px-16 py-3 text-sm rounded-sm'>
              PLACE ORDER
            </button>
          </div>

        </div>

      </div>

    </form>
  )
}

export default PlaceOrder