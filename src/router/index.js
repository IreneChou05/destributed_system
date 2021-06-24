import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/Home.vue'
import Predict from '@/components/Predict.vue'
import Training from '@/components/Training.vue'
import Dataset from '@/components/Dataset.vue'
import Login from '@/components/Login.vue'
import Signup from '@/components/Signup.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',//change to '/home' after finish
    name: 'Home',
    component: Home
  },
  {
    path: '/predict',
    name: 'Predict',
    component: Predict
  },
  {
    path: '/training',
    name: 'Training',
    component: Training
  },
  {
    path: '/dataset',
    name: 'Dataset',
    component: Dataset
  },
  {
    path: '/login',//change to '/' after finish
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
