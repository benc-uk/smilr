import { createLocalVue, shallowMount } from '@vue/test-utils'
import EventList from '@/components/EventList.vue'
import flushPromises from 'flush-promises'

// create an extended `Vue` constructor
const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue)

jest.mock('@/services/api')

describe('EventList.vue', () => {
  it('renders future events correctly', async () => {
    const wrapper = shallowMount(EventList, {
      localVue,
      propsData: {
        filter: 'future'
      },
    })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })

  it('renders past events correctly', async () => {
    const wrapper = shallowMount(EventList, {
      localVue,
      propsData: {
        filter: 'past'
      },
    })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })

  it('renders current events correctly', async () => {
    const wrapper = shallowMount(EventList, {
      localVue,
      propsData: {
        filter: 'active'
      },
    })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })  
})