import { createLocalVue, shallowMount } from '@vue/test-utils'
import Feedback from '@/components/Feedback.vue'

// create an extended `Vue` constructor
const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue)


describe('Feedback.vue', () => {
  it('shows event data', () => {
    const wrapper = shallowMount(Feedback, {
      localVue,
      propsData: {
        eventIdProp: 'fake01',
        topicIdProp: '1'
      }
    })

    wrapper.setData({
      event: {
        title: 'Fake event'
      },
      topic: {
        desc: 'Topic A',
        id: 1
      }
    })

    wrapper.vm.$nextTick(() => {
      expect(wrapper.html()).toContain('a')
      expect(wrapper.findAll('face-stub').length).toBe(5)
      expect(wrapper.find('h2').html()).toContain('Topic A')
    })
  })
})
