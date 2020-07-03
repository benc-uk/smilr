import { createLocalVue, shallowMount } from '@vue/test-utils'
import Error from '@/components/Error.vue'

// create an extended `Vue` constructor
const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue)

describe('Error.vue', () => {
  it('renders message when passed', () => {
    let msg = 'This is an error'

    const wrapper = shallowMount(Error, {
      localVue,
      propsData: {
        message: msg
      }
    })

    expect(wrapper).toMatchSnapshot()
  })
})
