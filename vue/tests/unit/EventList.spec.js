import { createLocalVue, shallowMount } from '@vue/test-utils'
import EventList from '@/components/EventList.vue'

// create an extended `Vue` constructor
const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue)

describe('EventList.vue', () => {
  it('renders events correctly', async () => {
    let title = 'Not real event'
    const wrapper = shallowMount(EventList, {
      localVue,
      propsData: {
        filter: 'future'
      },
      data() {
        return {
          events: [
            {
              title: title,
              _id: 'fake1',
              type: 'lab',
              start: '2025-01-01',
              end: '2025-02-01',
              topics: [
                { desc: 'Topic A', id: '1' },
                { desc: 'Topic B', id: '2' }
              ]
            },
            {
              title: 'dummy',
              _id: 'fake2',
              type: 'event',
              start: '2025-01-01',
              end: '2025-02-01',
              topics: [
                { desc: 'Topic A', id: '1' },
                { desc: 'Topic B', id: '2' }
              ]
            }
          ]
        }
      }
    })

    expect(wrapper.findAll('h2').length).toBe(2)
    expect(wrapper.find('h2').html()).toContain(title)
    expect(wrapper.find('h2').html()).toContain('icon="flask"')
    expect(wrapper.find('ul').findAll('li').length).toBe(2)
    expect(wrapper.find('ul').html()).toContain('Topic A')
    expect(wrapper.find('b-card-stub').html()).toContain('2025')
  })
})