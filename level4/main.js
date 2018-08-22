function Worker(id, first_name, status) {
  this.id = id;
  this.first_name = first_name;
  this.status = status;
  this.shifts = [];

  this.pricePerStatus = function () {
    switch (this.status) {
      case "medic":
        return 270;
      case "interne":
        return 126; 
      case "interim":
        return 480;
    }
  };

  this.numberOfShifts = function () {
    var sum = 0;
    for (var key in this.shifts) {
      this.shifts[key].isWeekend() ? sum += 2 : sum++;
    }
    return sum;
  };

  this.isInterim = function () {
    if (this.status == 'interim'){
      return true;
    } else {
      return false;
    }
  }

  this.getTotalPrice = function () {
    return this.pricePerStatus() * this.numberOfShifts();
  }
}

function Shift(id, planning_id, user_id, start_date) {
  this.id = id;
  this.planning_id = planning_id;
  this.user_id = user_id;
  this.start_date = start_date;

  this.isWeekend = function () {
    const weekday = new Date(this.start_date).getDay();

    if(weekday === 6 || weekday === 0) {
      return true;
    } else {
      return false;
    }
  }
}

function Commission(workers) {
  this.workers = workers;

  this.numberOfInterimShifts = function () {
    interim_workers = [];
    for (var key in this.workers){
      if (this.workers[key].isInterim()) {
        interim_workers.push(this.workers[key].shifts);
      }
    }
    return interim_workers[0].length;
  }

  this.interimFee = function () {
    return this.numberOfInterimShifts() * 80;
  }

  this.otherWorkersFee = function () {
    var sum = 0;
    for (var key in this.workers){
      sum += this.workers[key].getTotalPrice() * 0.05;
    }

    return sum;
  }

  this.getPdgFee = function () {
    return this.interimFee() + this.otherWorkersFee();
  }

}

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const workers = []
for (i = 0; i < data.workers.length; i++) {
	workers.push(new Worker(data.workers[i].id, data.workers[i].first_name, data.workers[i].status));
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

const commission = new Commission(workers);
const result = { "workers": [], "commission": { "pdg_fee": commission.getPdgFee(), "interim_shifts": commission.numberOfInterimShifts() } };
for (i = 0; i < workers.length; i++) {
  result['workers'].push({id: workers[i].id, price: workers[i].getTotalPrice()});
}

const json = JSON.stringify(result, null, 2);
fs.writeFileSync('output.json', json, 'utf8');
