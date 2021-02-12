import Vue from "vue";
import Router from "vue-router";
//import store from "./store";

Vue.use(Router);

let router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      component: () => import("@/views/Home.vue")
    },
    {
      path: "/Funding",
      component: () => import("@/views/Funding.vue")
    },
    {
      path: "/Expenditure",
      component: () => import("@/views/Expenditure.vue")
    },
    {
      path: "/Corruption",
      component: () => import("@/views/Corruption.vue")
    }
  ]
});

router.beforeEach((to, from, next) => {
  next();
  /* if (to.path !== '/Login') {
    if (localStorage.ccstoken) {
      fetch(store.getters.endpoint + "Tokenify/", {
          method: "post",
          body: localStorage.ccstoken
        })
        .then(response => {
          response.text().then(res => {
            if (response.status == 401) {
              router.push('/Login')
            } else {
              localStorage.ccstoken = res
              localStorage.lastRoute = to.path
              clearInterval(window.tokenify);
              window.tokenify = setInterval(() => {
                fetch(store.getters.endpoint + "Tokenceptor/", {
                    method: "post",
                    body: localStorage.ccstoken
                  })
                  .then(response => {
                    response.text().then(res => {
                      if (response.status == 401) {
                        clearInterval(window.tokenify);
                        router.push('/Login')
                      }
                    });
                  })
              }, 10000)
              next();
            }
          });
        })
    } else {
      next('/Login')
    }
  } else {
    next()
  } */
});

export default router;
