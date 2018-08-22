function Worker(id, first_name, price_per_shift) {
  this.id = id;
  this.first_name = first_name;
  this.price_per_shift = price_per_shift;
  this.shifts = [];

  this.getTotalPrice = function () {
    return this.price_per_shift * this.shifts.length;
  }
}

function Shift(id, planning_id, user_id, start_date) {
  this.id = id;
  this.planning_id = planning_id;
  this.user_id = user_id;
  this.start_date = start_date;
}

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const workers = []
for (i = 0; i < data.workers.length; i++) {
  workers.push(new Worker(data.workers[i].id, data.workers[i].first_name, data.workers[i].price_per_shift));
}

const shifts = []
for (i = 0; i < data.shifts.length; i++) {
  shifts.push(new Shift(data.shifts[i].id, data.shifts[i].planning_id, data.shifts[i].user_id, data.shifts[i].start_date));
}

for (i = 0; i < workers.length; i++) {
  for (j = 0; j < shifts.length; j++) {
    if (shifts[j].user_id == workers[i].id) {
      workers[i].shifts.push(shifts[j]);  
    }
  }
}

const result = { "workers": [] };
for (i = 0; i < workers.length; i++) {
  result['workers'].push({id: workers[i].id, price: workers[i].getTotalPrice()});
}

const json = JSON.stringify(result, null, 2);
fs.writeFileSync('output.json', json, 'utf8');