<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated
      style="background-color: #28456D">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          <q-img src="logo-w.svg" style="width: 80px;" />
          Node Race
        </q-toolbar-title>

        <div><q-btn label="Feedback" flat /></div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>

        <q-item-label
          header
          class="text-grey-8 q-pl-md"
          style="padding-top: 0"
        >
          <q-img src="logo.svg" style="width: 80px;" />
          <br />
            <b>Node Race</b>
        </q-item-label>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

const linksData = [
  {
    title: 'Home',
    caption: 'quasar.dev',
    icon: 'home',
    link: ''
  },
  {
    title: 'ZooBC Block Explorer',
    caption: '',
    icon: 'link',
    link: ''
  },
  {
    title: 'ZooBC Web Wallet',
    caption: '',
    icon: 'link',
    link: ''
  },
  {
    title: 'ZooBC Forum',
    caption: '',
    icon: 'link',
    link: ''
  },
  {
    title: 'Leave the race',
    caption: '',
    icon: 'logout',
    link: ''
  },
  {
    title: 'Language',
    caption: '',
    icon: 'language',
    link: ''
  }
];

export default {
  name: 'MainLayout',
  components: { EssentialLink },
  data () {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksData
    }
  }
}
</script>
