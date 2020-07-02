import { createLocalVue, shallowMount } from '@vue/test-utils'
import Feedback from '@/components/Feedback.vue'
import flushPromises from 'flush-promises'

const localVue = createLocalVue()
import BootstrapVue from 'bootstrap-vue'
localVue.use(BootstrapVue)

jest.mock('@/mixins/api')

describe('Feedback.vue', () => {
  it('shows event data', async () => {
    const wrapper = shallowMount(Feedback, {
      localVue,
      propsData: {
        eventIdProp: 'fake3',
        topicIdProp: '1'
      }
    })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
