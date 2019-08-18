import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import About from '@/components/About.vue'

describe('About.vue', () => {
  it('renders ver when passed', () => {
    const ver = require('../../package.json').version
    
    const wrapper = shallowMount(About, {})
    expect(wrapper.text()).to.include(ver)
  })
})
