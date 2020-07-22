import { createLocalVue, mount } from '@vue/test-utils'
import Admin from '@/components/Admin.vue'
import flushPromises from 'flush-promises'

import BootstrapVue from 'bootstrap-vue'
const localVue = createLocalVue()
localVue.use(BootstrapVue)

jest.mock('@/services/api')

describe('Admin.vue', () => {
  it('renders admin screen', async () => {
    const wrapper = mount(Admin, { localVue })

    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
