import { expect } from 'chai'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import EventList from '@/components/EventList.vue'

// create an extended `Vue` constructor
const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue);

describe('EventList.vue', () => {
  it('renders events correctly', () => {   
    const wrapper = shallowMount(EventList, {
      localVue,
      propsData: {
        filter: "past"
      }
    })

    let title = "Not real event"
    wrapper.setData({
      events: [
        {
          title: title, 
          type: "lab", 
          start: "2020-01-01", 
          topics: [
            { desc: "Topic A", id: 1 },
            { desc: "Topic B", id: 2 } 
          ]
        },
        {
          title: "dummy", 
          type: "event", 
          start: "2020-01-01", 
          topics: [
            { desc: "Topic A", id: 1 },
            { desc: "Topic B", id: 2 } 
          ]
        }        
      ]
    })
    
    expect(wrapper.findAll('h1').length).to.equal(2);
    expect(wrapper.find('h1').html()).to.contain(title);
    expect(wrapper.find('h1').html()).to.contain('icon="flask"');
    expect(wrapper.find('ul').findAll('li').length).to.equal(2);
    expect(wrapper.find('ul').html()).to.contain("Topic A");
    expect(wrapper.find('b-card-stub').html()).to.contain("January 1st 2020");
  })
})
