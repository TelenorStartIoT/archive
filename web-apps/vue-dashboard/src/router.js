/* eslint-disable */

import Vue        from 'vue'
import Router     from 'vue-router'
const Login       = () => import('@/view/Login')
const Logout      = () => import('@/view/Logout')
const Dashboard   = () => import('@/view/dashboard/Dashboard')
const Boards      = () => import('@/view/dashboard/boards/Boards')
const Board       = () => import('@/view/dashboard/boards/Board')
const Settings    = () => import('@/view/dashboard/settings/Settings')
const Domains     = () => import('@/view/dashboard/settings/Domains')
const Users       = () => import('@/view/dashboard/settings/Users')
const Rules       = () => import('@/view/dashboard/settings/Rules')
const RuleEditor  = () => import('@/view/dashboard/settings/RuleEditor')
const Export      = () => import('@/view/dashboard/settings/Export')
const Profile     = () => import('@/view/dashboard/settings/Profile')
const About       = () => import('@/view/dashboard/settings/About')
const ThingTypes  = () => import('@/view/dashboard/thingtypes/ThingTypes')
const ThingType   = () => import('@/view/dashboard/thingtypes/ThingType')

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/',
  linkExactActiveClass: '',
  routes: [
    { path: '/',                        component: Login,       name: 'login'         },
    { path: '/logout',                  component: Logout,      name: 'logout'        },
    { path: '/dashboard',               component: Dashboard,
      children: [
        { path: '', redirect: 'boards' },
        { path: 'boards',               component: Boards,
          children: [
            { path: ':boardId/:viewId', component: Board,       name: 'board'         }
          ]
        },
        { path: 'settings',             component: Settings,
          children: [
            { path: '', redirect: 'domains' },
            { path: 'domains',          component: Domains,     name: 'domains'       },
            { path: 'users',            component: Users,       name: 'users'         },
            { path: 'rules',            component: Rules,       name: 'rules',        },
            { path: 'rules/:ruleId',    component: RuleEditor,  name: 'ruleeditor',   },
            { path: 'export',           component: Export,      name: 'export',       },
            { path: 'profile',          component: Profile,     name: 'profile'       },
            { path: 'about',            component: About,       name: 'about'         }
          ]
        },
        { path: 'things',               component: ThingTypes,
          children: [
            { path: ':thingType',       component: ThingType,   name: 'thingtype'     }
          ]
        },
      ]
    }
  ]
})
