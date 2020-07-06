<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.mineID" placeholder="请输入矿场ID" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" sortable align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="矿场ID" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mine_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理端地址" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型名称" width="250px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="矿机可用数量" align="center" width="150px">
        <template slot-scope="{row}">
          <span @click="AutoUpdateMineInfo(row.mine_id,1)">{{ row.ava_acount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总数量" align="center" width="95">
        <template slot-scope="scope">
          <span @click="AutoUpdateMineInfo(row.mine_id,2)">{{ scope.row.total_acount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdateUserInfo(row)">
            更新配置
          </el-button>
          <el-button type="primary" size="mini" @click="AutoUpdateMineInfo(row.mine_id,3)">
            自动更新
          </el-button>
          <el-button size="mini" type="danger" disabled @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="修改配置" :visible.sync="mineInfoDialogFormVisible">
      <el-form ref="mineInfoForm" :model="mineInfoForm" label-position="left" label-width="100px" style="width: 300px; margin-left:50px;">
        <el-form-item label="矿场ID" prop="mine_id">
          <template>
            <span>{{ mineInfoForm.mine_id }}</span>
          </template>
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <template>
            <el-input v-model="mineInfoForm.name" />
          </template>
        </el-form-item>
        <el-form-item label="可用数量" prop="ava_acount">
          <el-input v-model="mineInfoForm.ava_acount" type="number" />
        </el-form-item>

        <el-form-item label="总数量" prop="total_acount" type="number">
          <el-input v-model="mineInfoForm.total_acount" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="mineInfoDialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateUserInfoData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getMineList, updateMineInfo, autouUpdateMineInfo } from '@/api/mine'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'MineList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        mineID: null,
        page: 1,
        limit: 20
      },
      mineInfoForm: {
        mine_id: 0,
        name: '',
        ava_acount: 0,
        total_acount: 0
      },
      dialogFormVisible: false,
      roleDialogFormVisible: false,
      mineInfoDialogFormVisible: false,

      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getMineList(this.listQuery).then(response => {
        const tmpListData = response.data
        this.list = tmpListData.data
        this.total = tmpListData.length
        this.listLoading = false
      })
    },
    handleFilter() {
      this.getList()
    },

    handleUpdateUserInfo(row) {
      this.mineInfoForm = {
        mine_id: row.mine_id,
        name: row.name,
        ava_acount: row.ava_acount,
        total_acount: row.total_acount
      }
      this.mineInfoDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['mineInfoForm'].clearValidate()
      })
    },
    updateUserInfoData() {
      this.$refs['mineInfoForm'].validate((valid) => {
        if (valid) {
          const tempData = {
            'mineID': this.mineInfoForm.mine_id,
            'name': this.mineInfoForm.name,
            'avaAcount': parseInt(this.mineInfoForm.ava_acount),
            'totalAcount': parseInt(this.mineInfoForm.total_acount)
          }
          // console.log('updateData', tempData)
          updateMineInfo(tempData).then(response => {
            if (response.status === 2000) {
              this.mineInfoDialogFormVisible = false
              this.$notify({
                title: '修改用户信息',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              //  重新刷新 UserList
              this.getList()
            } else {
              this.$notify({
                title: '修改用户信息',
                message: response.msg,
                type: 'error',
                duration: 2000
              })
            }
          })
        }
      })
    },
    AutoUpdateMineInfo(mineID, types) {
      // warning
      this.$confirm(`ID:${mineID} 确认自动更新配置信息 [type: ${types}]?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const tempData = {
          'mineID': mineID,
          'type': types
        }
        // console.log('updateData', tempData)
        autouUpdateMineInfo(tempData).then(response => {
          if (response.status === 2000) {
            this.$notify({
              title: '自动更新',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            //  重新刷新 UserList
            this.getList()
          } else {
            this.$notify({
              title: '自动更新',
              message: response.msg,
              type: 'error',
              duration: 2000
            })
          }
        })
      }).catch(err => {
        console.error(err)
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '删除用户',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
    // getFormatTime(timestamp) {
    //   return parseTime(timestamp)
    // }
  }
}
</script>
