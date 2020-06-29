<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.mineID" placeholder="请输入矿场ID" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button> -->
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleAddMachine">
        添加机器
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
      <el-table-column label="用户名" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密码" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型名称" width="250px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前状态" align="center" width="150px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status| StatusNormalFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否等待更新" align="center" width="110">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.up_status| StatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdateUserInfo(row)">
            查看算力
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="算力变化" :visible.sync="mineInfoDialogFormVisible">
      <line-chart :chart-data="lineChartData" />
    </el-dialog>

    <el-dialog title="新增机器" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="machineInfoForm" label-position="left" label-width="100px" style="width: 300px; margin-left:50px;">
        <el-form-item label="矿场ID" prop="mine_id">
          <template>
            <el-input v-model="machineInfoForm.mine_id" />
          </template>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <template>
            <el-input v-model="machineInfoForm.ip" />
          </template>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="machineInfoForm.username" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="machineInfoForm.password" />
        </el-form-item>
      </el-form>
      <div>
        <list />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="AddMachinesData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateMineInfo, GetMachineList, AddMachines, DelMachines } from '@/api/mine'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import list from './list'
import LineChart from '../components/lineChart'
const statusOptions = [
  { key: 120, value: '未知' },
  { key: 121, value: '未挖矿' },
  { key: 122, value: '默认挖矿' },
  { key: 123, value: '用户租用' },
  { key: 124, value: '等待创建' }
]
// arr to obj, such as { CN : "China", US : "USA" }
const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.value
  return acc
}, {})
export default {
  name: 'MachineList',
  components: { Pagination, list, LineChart },
  directives: { waves },
  filters: {
    StatusFilter(type) {
      if (type === 130) {
        return '是'
      }
      return '否'
    },
    StatusNormalFilter(type) {
      return statusKeyValue[type]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      mineInfoForm: {
        mine_id: 0,
        ip: ''
      },
      machineInfoForm: {
        mine_id: '',
        ip: '',
        password: '',
        username: ''
      },
      lineChartData: {
        xAxisData: [],
        actualData: [],
        name: '过去二十四小时算力变化'
      },
      statusOptions,
      dialogFormVisible: false,
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
      GetMachineList(this.listQuery).then(response => {
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
        ip: row.ip
      }
      this.mineInfoDialogFormVisible = true
    },
    updateUserInfoData() {
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
    },
    handleDelete(row) {
      const msgTip = `ID: ${row.id}  确认要删除当前机器: ${row.ip})?`
      const msgTitle = '删除机器'
      this.$confirm(msgTip, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const tmpData = {
          'mineID': row.mine_id,
          'ip': row.ip
        }
        DelMachines(tmpData).then(() => {
          this.$notify({
            title: msgTitle,
            message: '成功',
            type: 'success',
            duration: 2000
          })
          // 重新刷新 List
          this.getList()
        }).catch(err => {
          console.error(err)
          this.$notify({
            title: msgTitle,
            message: '失败',
            type: 'error',
            duration: 2000
          })
        })
      }).catch({

      })
    },
    resetTemp() {
      this.machineInfoForm = {
        mine_id: '',
        ip: '',
        password: '',
        username: ''
      }
    },
    handleAddMachine() {
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    AddMachinesData() {
      const tempData = {
        'mineID': this.machineInfoForm.mine_id,
        'ip': this.machineInfoForm.ip,
        'username': this.machineInfoForm.username,
        'password': this.machineInfoForm.password
      }
      // console.log('updateData', tempData)
      AddMachines(tempData).then(response => {
        if (response.status === 2000) {
          this.dialogFormVisible = false
          this.$notify({
            title: '添加机器',
            message: '成功',
            type: 'success',
            duration: 2000
          })
          //  重新刷新 UserList
          this.getList()
        } else {
          this.$notify({
            title: '添加机器',
            message: response.msg,
            type: 'error',
            duration: 2000
          })
        }
      })
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
