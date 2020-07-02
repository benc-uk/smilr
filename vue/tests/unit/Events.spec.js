import { shallowMount } from '@vue/test-utils'
import Events from '@/components/Events.vue'
import EventList from '@/components/EventList.vue'
import flushPromises from 'flush-promises'

jest.mock('@/mixins/api')

describe('Events.vue', () => {
  it('shows active events', async () => {
    const wrapper = shallowMount(Events, { stubs: {'EventList': EventList} })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })

  it('shows past events', async () => {
    const wrapper = shallowMount(Events, { stubs: {'EventList': EventList} })
    wrapper.setData({ time: 'past' })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })

  it('shows future events', async () => {
    const wrapper = shallowMount(Events, { stubs: {'EventList': EventList} })
    wrapper.setData({ time: 'future' })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })    
})
