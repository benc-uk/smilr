import { shallowMount } from '@vue/test-utils'
import Home from '@/components/Home.vue'
import EventList from '@/components/EventList.vue'
import flushPromises from 'flush-promises'

jest.mock('@/mixins/api')

describe('Home.vue', () => {
  it('renders home screen', async () => {
    const wrapper = shallowMount(Home, { stubs: {'EventList': EventList} })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
