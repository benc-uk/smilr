import { expect } from 'chai'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Events from '@/components/Events.vue'

// create an extended `Vue` constructor
const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue);

describe('Events.vue', () => {
  it('has dropdown with options', () => {   
    const wrapper = shallowMount(Events, {
      localVue
    })  

    expect(wrapper.contains('b-form-select-stub')).to.be.true;
    expect(wrapper.find('b-form-select-stub').findAll('option')).has.length(4)
  })
})
