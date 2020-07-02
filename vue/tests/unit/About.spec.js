import { shallowMount } from '@vue/test-utils'
import About from '@/components/About.vue'

describe('About.vue', () => {
  it('renders current app version', () => {

    const wrapper = shallowMount(About, {})
    expect(wrapper).toMatchSnapshot()
  })
})
