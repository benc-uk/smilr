import { expect } from 'chai'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import EventList from '@/components/EventList.vue'

// create an extended `Vue` constructor
const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue);

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

    expect(wrapper.findAll('h2').length).to.equal(2);
    expect(wrapper.find('h2').html()).to.contain(title);
    expect(wrapper.find('h2').html()).to.contain('icon="flask"');
    expect(wrapper.find('ul').findAll('li').length).to.equal(2);
    expect(wrapper.find('ul').html()).to.contain('Topic A');
    expect(wrapper.find('b-card-stub').html()).to.contain('January 1st 2025');
  })
})