import {LightningElement, track, wire, api} from 'lwc';
import TODO_Object from '@salesforce/schema/Todo__c';
import TODO_NAME from '@salesforce/schema/Todo__c.Name';
import TODO_DESCRIPTION from '@salesforce/schema/Todo__c.Description__c';
import TODO_DUE_DATE from '@salesforce/schema/Todo__c.Due_Date__c';
import TODO_PRIORITY from '@salesforce/schema/Todo__c.Priority__c';
import TODO_CATEGORY from '@salesforce/schema/Todo__c.Category__c';
import TODO_STATUS from '@salesforce/schema/Todo__c.Status__c';
import TODO_RECORD_TYPE from '@salesforce/schema/Todo__c.RecordType.Name'
import { NavigationMixin } from 'lightning/navigation';

// importing apex class methods
import getTodos from '@salesforce/apex/TodoListController.getTodos';
import deleteTodo from '@salesforce/apex/TodoListController.deleteTodo';


// importing to refresh the apex if any record changes the datas
import {refreshApex} from '@salesforce/apex';

const actions= [
    { label: 'Edit', name: 'edit'}, 
    { label: 'Delete', name: 'delete'}
]
const  columns = [
    { label: 'Name', fieldName: TODO_NAME.fieldApiName }, 
    { label: 'Description', fieldName: TODO_DESCRIPTION.fieldApiName, type: 'text'},
    { label: 'Due Date', fieldName: TODO_DUE_DATE.fieldApiName, type: 'date'}, 
    { label: 'Status', fieldName: TODO_STATUS.fieldApiName,type: 'picklist'}, 
    { label: 'Priority', fieldName: TODO_PRIORITY.fieldApiName, type: 'picklist'},
    { label: 'Category', fieldName: 'Category__c', type: 'picklist'},
    { label: 'Record Type' , fieldName: 'RecordType.Name', actions:[
        { label: 'All', checked: true, name:'all' },
        { label: 'Season', checked: false, name:'Season' },
        { label: 'Position', checked: false, name:'Position' }
    ]}, 
    {type: "button",  initialWidth: 80, typeAttributes: {  
        label: 'Edit',  
        name: 'Edit',  
        title: 'Edit',  
        disabled: false,  
        value: 'edit',   
        iconPosition: 'center'  
    }}  ,
    {type: "button", initialWidth: 80, typeAttributes: {  
        label: 'Delete',  
        name: 'Delete',  
        title: 'Delete',  
        disabled: false,  
        value: 'delete',  
        iconPosition: 'center'  
    }}  
];

export default class TodoList extends NavigationMixin (LightningElement) {
   
    
    @api recordId;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';
    result;
    // reactive variable
    @track todo;
    @track data;
    @track columns = columns;
    @track record = [];
    @track currentRecordId;
    @track showLoadingSpinner = false;
    @track error;
    @track selectedRows;
    @track deleteSelectedButtonDisabled = true;

    // non-reactive variables
    objectApiName = TODO_Object;

    todoName = TODO_NAME;
    todoDescription = TODO_DESCRIPTION;
    todoDueDate = TODO_DUE_DATE;
    todoPriority = TODO_PRIORITY;
    todoStatus = TODO_STATUS;
    todoCategory = TODO_CATEGORY;
    todoRecordType= TODO_RECORD_TYPE;
    selectedRecords = [];
    refreshTable;
    todos=[];
    
    

       // flas
    showTable = false;
    
    navigateToNewTodo() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
              objectApiName: 'Todo__c',
              actionName: 'new'
            },
            state: {
              useRecordTypeCheck: 1
            }
          });
      
           return refreshApex(this.refreshTable);   
       }   

   
    // retrieving the data using wire service
    @wire(getTodos, {searchKey: '$searchKey', 
                     sortBy: '$sortedBy', 
                     sortDirection: '$sortedDirection'})
    todos(result) {
        this.refreshTable = result;
      
        if (result.data) {
            this.data = result.data;
            this.error = undefined;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
    }}


    handleHeaderAction (event) {
        // Retrieves the name of the selected filter
        const actionName = event.detail.action.name;
        // Retrieves the current column definition
        // based on the selected filter
        const colDef = event.detail.columnDefinition;
        const columns = this.columns;
        const activeFilter = this.activeFilter;
    
        if (actionName !== activeFilter) {
            var idx = columns.indexOf(colDef);
            // Update the column definition with the updated actions data
            var actions = columns[idx].actions;
            actions.forEach((action) => {
                action.checked = action.name === actionName;
            });
            this.activeFilter = actionName;
            this.updateTodos();
            this.columns = columns;
        }}
    
    updateTodos(cmp) {
        const rows = this.rawData;
        const activeFilter = this.activeFilter;
        const filteredRows = rows;
        if (activeFilter !== 'all') {
            filteredRows = rows.filter(function (row) {
                return (activeFilter === 'season' ||
                  activeFilter === 'position');
                });
        }
        this.data = filteredRows;
    }

      
    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return refreshApex(this.result);
        
    }
  
    handleSearchKeyChange( event ) {
        this.searchKey = event.target.value;
        return refreshApex(this.result);
    }    
    
    callRowAction( event ) {  
          
        const recId =  event.detail.row.Id;  
        const actionName = event.detail.action.name;  
        if ( actionName === 'Edit' ) {  
  
            this[NavigationMixin.Navigate]({  
                type: 'standard__recordPage',  
                attributes: {  
                    recordId: event.detail.row.Id,  
                    objectApiName: 'Todo__c',  
                    actionName: 'edit'  
                }  
            })  
            return refreshApex(this.refreshTable);
  
        } else if ( actionName === 'Delete') {  
            var idList = [];
            const recId =  event.detail.row.Id; 
            idList.push(recId);
            this.deleteRecords(idList);
        }
        return refreshApex(this.refreshTable);
    }


        deleteRecords(idList){
            console.log('To Be Deleted:'+JSON.stringify(idList));
            deleteTodo({idList: idList})
                .then(result => {
                    console.log('Deleted');
                    this.handleSearch();
                });
                return refreshApex(this.refreshTable);
        }
        handleRowSelection(event){
        
            const selectedRows = event.detail.selectedRows;
            console.log('Selected Rows: '+JSON.stringify(selectedRows));
            this.selectedRows = selectedRows;
            if(this.selectedRows != undefined && this.selectedRows.length>0){
                this.deleteSelectedButtonDisabled = false;
            }
            else{
                this.deleteSelectedButtonDisabled = true;
            }
        }
        deleteSelectedTodos(event){
            var idList = [];
            var selectedRows = this.selectedRows;
            for(var x in selectedRows){
                idList.push(selectedRows[x].Id);
            }
            this.deleteRecords(idList);
        }

    }
