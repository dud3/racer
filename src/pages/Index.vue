<template>
  <q-page class="row col-12 q-pa-md">
    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12 text-center">
        <div class="q-pr-md q-pl-md">
          <div id="container" class="container" v-show="show.topdown" style="position: relative">
            <q-btn @click="swapCanvas();" icon="zoom_in" dense flat style="z-index: 99999999; font-weight:bold; text-align:right;position: absolute;bottom: 10px; right: 10px;" class="text-white" v-show="show.topdown" />
          </div>
          <div id="container1" class="container" v-show="show.chase" style="position: relative">
            <q-btn @click="swapCanvas();" icon="zoom_out" dense flat style="z-index: 99999999; font-weight:bold; text-align:right;position: absolute;bottom: 10px; right: 10px;" class="text-white" v-show="show.chase" />
          </div>
        </div>
    </div>
    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="real" label="Real time" />
          <q-tab name="recent" label="Recent events" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="real" class="no-padding">
            <q-input class="q-pa-md" label="Search" icon="language" outlined>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <div>
              <q-table
                :data="this.queue.nodes"
                :columns="table.nodes.columns"
                :loading="loading"
                row-key="pubkey"
                :pagination.sync="table.nodes.pagination"
                binary-state-sort
                flat
              >
                <template v-slot:body-cell-edit="props">
                  <q-td class="cursor-pointer" :props="props">
                    <q-btn @click="selected.node = props.row; dialogs.account = true;" color="primary" text-color="white" icon="edit" round></q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-tab-panel>

          <q-tab-panel name="recent">
            <q-input label="Search" icon="language" outlined>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-table
              :data="this.events"
              :columns="table.events.columns"
              :loading="loading"
              row-key="pubkey"
              :pagination.sync="table.events.pagination"
              binary-state-sort
              flat
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <q-dialog v-model="dialogs.account">
      <q-card style="width: 800px;">
        <q-card-section>
          <div class="text-h6">Change the account name</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Change the display name for the account:

          <br><br>

          <span class="text-grey">{{ selected.node.showPubkey }}</span>

          <br><br>

          It is stored locally and will get reset with a new browser session.

          <br><br>
          <b>Name</b><br>
          <q-input label="Email address name" outlined/>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Change" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import http from './../lib/http'

export default {
  name: 'PageIndex',
  data () {
    return {
        tab: 'real',

        table: {
            nodes: {
                columns: [
                    { name: 'position', label: 'Position', align: 'left', field: 'position', sortable: true },
                    { name: 'funds', align: 'left', label: 'Locked  ZBC', field: 'funds', sortable: true },
                    { name: 'showPubkey', label: 'Account', field: 'showPubkey', align: 'left', sortable: true },
                    { name: 'edit', label: '', field: 'edit', align: 'left', sortable: false },
                ],
                pagination: {
                    sortBy: 'funds',
                    descending: true,
                    page: 1,
                    rowsPerPage: 8
                }
            },

            events: {
                columns: [
                    { name: 'height', label: 'Height', align: 'left', field: 'height', sortable: true },
                    { name: 'funds', label: 'Funds', align: 'left', field: 'funds', sortable: true },
                    { name: 'joined', label: 'Joined', align: 'left', field: 'joined', sortable: true },
                    { name: 'node', label: 'Node', align: 'left', field: 'showPubkey', sortable: true }
                ],
                pagination: {
                    sortBy: 'height',
                    descending: false,
                    page: 1,
                    rowsPerPage: 16
                },
            }
        },

        selected: {
          node: {}
        },

        dialogs: {
          account: false
        },

        queue: {},
        events: [],

        simulation: {
          topdown: undefined,
          chase: undefined
        },

        show: {
          chase: true,
          topdown: true
        },

        initcanvas2: false,

        loading: false
    }
  },

  created () {
    this.$q.loading.show()
    this.main().then(() => {
      this.$q.loading.hide()
    }).catch(() => { this.loading = false })
  },

  mounted () {
    this.simulation.chase = new window.roadBuilder({
      containerId: 'container',
      initCamera: 'topdown',
      visible: {
        cars: false,
        grid: false
      }
    })
  },

  methods: {
    swapCanvas () {
      this.$q.loading.show()

      this.show.topdown = !this.show.topdown
      this.show.chase = !this.show.topdown

      const c = document.getElementById('label-renderer-container')
      const c1 = document.getElementById('label-renderer-container1')

      document.getElementById('label-renderer-container').style.display = this.show.topdown ? 'block' : 'none'
      if (c1) { c1.style.display = !this.show.topdown ? 'block' : 'none' }

      setTimeout(() => {
        if (!this.initcanvas2) {
          this.simulation.topdown = new window.roadBuilder({
            containerId: 'container1',
            initCamera: 'chase',
            visible: {
              cars: true,
              grid: false
            }
          })

          this.queue.nodes.slice(0, 24).sort((a, b) => parseInt(a.funds) - parseInt(b.funds)).map((node, i) => {
            this.simulation.topdown.theCarsManager.add(node.position, node.funds * i)
          })

          this.simulation.topdown.theCarsManager.cars[0].activeCamera = true

          this.initcanvas2 = true
        }

        this.$q.loading.hide()
      }, 400)
    },
    main () {
        return new Promise((resolve, reject) => {
            http({ method: 'get', url: '/queue' }).then((r) => {
              this.queue = r.data
              // console.log(this.queue)

              this.queue.nodes.map(r => {
                r.showPubkey = r.pubkey.slice(0, 8) + '...' + r.pubkey.slice(-4)
              })

              this.queue.nodes.sort((a, b) => parseInt(b.funds) - parseInt(a.funds)).map((e, i) => {
                e.position = i + 1
              })

              console.log(this.simulation.topdown)

              this.queue.nodes.slice(0, 24).sort((a, b) => parseInt(a.funds) - parseInt(b.funds)).map((node, i) => {
                this.simulation.chase.theCarsManager.add(node.position, node.funds * i)
              })

              window.simulation = this.simulation

              // r.position = Math.floor(Math.random() * this.queue.nodes.length)

              http({ method: 'get', url: '/events'}).then((r) => {
                  this.events = r.data.events.map(e => {
                    e.showPubkey = e.node.slice(0, 8) + '...' + e.node.slice(-4)

                    return e
                  })
              }).catch(() => { reject() }).finally(() => { resolve() })
          }).catch(() => { reject() })
        })
    }
  }
}
</script>

<style>
  html, body {
     margin: 0;
     height: 100%;
  }
  .container {
     width: 100%;
     height: 500px;
     display: block;
  }
  .label {
    padding: 8px;
    background-color: #7cb3ff;
    border-radius: 50%;
    border: 1px solid #000;
  }
</style>
