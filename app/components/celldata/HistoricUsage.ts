/// <reference path='../../../tools/typings/tsd/moment/moment.d.ts' />
/// <reference path='../../../tools/typings/tsd/underscore/underscore.d.ts' />

import {Component, NgModel, NgFor} from 'angular2/angular2';
import {FORM_DIRECTIVES, NgClass, NgSelectOption} from 'angular2/angular2';
import {CellDataServices} from '../../services/CellDataServices';
import {IUsage, ICycle, IPerson} from '../../common/interfaces/CellDataInterfaces';
import {UsageDetails} from './UsageDetails';
import {UsageColumnChart} from '../../directives/UsageColumnChart';

interface IExtendedCycle extends ICycle {
    description:string;
}

interface IModel {
    personId: string;
    personUsage: IUsage[];
    people: IPerson[];
}

@Component({
    selector: 'historic-usage',
    viewBindings: [CellDataServices],
    templateUrl: './components/celldata/HistoricUsage.html',
    directives: [NgModel, NgClass, NgFor, FORM_DIRECTIVES, NgSelectOption, UsageColumnChart,
                 UsageDetails],
    styleUrls: ['./components/celldata/HistoricUsage.css']
})
export class HistoricUsage implements IModel {

    _personId:string = '';
    people = [];
    _personUsage = [];
    animationTime:number = 5000;

    constructor(public cellDataServices:CellDataServices) {
        this.getPeople();
    }

    get personUsage() : IUsage[] {
        return this._personUsage;
    }

    set personUsage(val:IUsage[]) {
        this._personUsage = val;
    }

    get personId():string {
        return this._personId;
    };

    set personId(val:string) {
        this._personId = val;
        this.updateUsage();
    };

    getPeople() {
        this.cellDataServices.getPeople()
            .subscribe(people => {
                    this.people = people;
                    if (this.people.length > 0) {
                        this.personId = this.people[0].personId.toString();
                    }
                });
    }

    updateUsage() {
        this.personUsage = [];
        let personId = this.personId;
        if (personId === '') {
            return;
        }

        var start = moment('2000 01 01', 'YYYY MM DD');
        var end = moment();

        this.cellDataServices.getUsageForPerson(parseInt(personId),
                                                start.toDate(), end.toDate())
            .subscribe(usage => {
                this.personUsage = usage;
             });
    }

    getPersonNameFromId(personId:number) : string {
        let person = this.getPerson(personId);
        return this.getPersonName(person);
    }

    getPersonName(person:IPerson):string {
        if (!person) {
            return 'Unknown';
        }
        return person.firstName + ' ' + person.lastName;
    }

    getPerson(personId:number) : IPerson {
        return _.find(this.people, p => p.personId === personId);
    }

    getCurrentPerson() : IPerson {
        if (!this.personId) {
            return null;
        }

        return this.getPerson(parseInt(this.personId));
    }
}
