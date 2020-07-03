import { mount, createLocalVue } from '@vue/test-utils'
import Login from '@/components/Login.vue'
import flushPromises from 'flush-promises'

import BootstrapVue from 'bootstrap-vue'
const localVue = createLocalVue()
localVue.use(BootstrapVue)

import VueRouter from 'vue-router'
localVue.use(VueRouter)
const router = new VueRouter()

describe('Login.vue', () => {
  it('renders login screen', async () => {
    const wrapper = mount(Login, { localVue, router })

    wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
