import { createLocalVue, mount } from '@vue/test-utils'
import Report from '@/components/Report.vue'
import flushPromises from 'flush-promises'

import BootstrapVue from 'bootstrap-vue'
const localVue = createLocalVue()
localVue.use(BootstrapVue)

jest.mock('@/services/api')

describe('Report.vue', () => {
  it('renders feedback report', async () => {
    const wrapper = mount(Report, { localVue })
    wrapper.setData({ selectedIndex: 1 })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
