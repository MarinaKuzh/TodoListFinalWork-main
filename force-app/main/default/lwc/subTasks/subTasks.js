import {LightningElement, track, wire,api} from 'lwc';
import SUB_TODO_Object from '@salesforce/schema/Sub_Task__c';
import SUB_TODO_NAME from '@salesforce/schema/Sub_Task__c.Name';
import SUB_TODO_DESCRIPTION from '@salesforce/schema/Sub_Task__c.Description__c';
import SUB_TODO_STATUS from '@salesforce/schema/Sub_Task__c.Status__c';
import { NavigationMixin } from 'lightning/navigation';

// importing apex class methods
import getSubTask from '@salesforce/apex/SubTodoListController.getSubTask'; 
import deleteSubTasks from '@salesforce/apex/SubTodoListController.deleteSubTasks';


// importing to refresh the apex if any record changes the datas
import {refreshApex} from '@salesforce/apex';

// row actions
const actions = [
    { label: 'Edit', name: 'edit'}, 
    { label: 'Delete', name: 'delete'}
];

// datatable columns with row actions
const columns = [
    { label: 'Name', fieldName: SUB_TODO_NAME.fieldApiName }, 
    { label: 'Description', fieldName: SUB_TODO_DESCRIPTION.fieldApiName, type: 'text'},
    { label: 'Status', fieldName: SUB_TODO_STATUS.fieldApiName, type: 'picklist',actions: [
        { label: 'All', checked: true, name:'all' },
        { label: 'Not Started', checked: false, name:'not Started' },
        { label: 'In Progress', checked: false, name:'in Progress' },
        { label: 'Completed', checked: false, name:'completed' }
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

export default class SubTodo extends NavigationMixin (LightningElement) {
    @api recordId;
    @track subTask;
    @track data;
    @track columns = columns;
    @track record = [];
    @track bShowModal = false;
    @track currentRecordId;
    @track isEditForm = false;
    @track showLoadingSpinner = false;
    @track error;
    @track deleteSelectedButtonDisabled = true;

    objectApiName = SUB_TODO_Object;
    openModal = false;

    subTodoName = SUB_TODO_NAME;
    subTodoDescription = SUB_TODO_DESCRIPTION;
    subTodoStatus = SUB_TODO_STATUS;
    selectedRecords = [];
    refreshTable;

    navigateToNewSubTodo() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
              objectApiName: 'Sub_Task__c',
              actionName: 'new'
            },
            state: {
              useRecordTypeCheck: 1
            }
          });
      
           return refreshApex(this.refreshTable);   
       }   

   @wire(getSubTask)
    subTasks(result) {
        this.refreshTable = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }     
    handleRowActions(event) {
        const recId =  event.detail.row.Id;  
        const actionName = event.detail.action.name;  
        if ( actionName === 'Edit' ) {  
            this[NavigationMixin.Navigate]({
                type: "standard__recordPage",
                attributes: {
                    recordId: event.detail.row.Id,
                    objectApiName : "SubTask__c",
                    actionName: "edit"
                }
            });
        }else if ( actionName === 'Delete') {  
            var idList = [];
            const recId =  event.detail.row.Id; 
            idList.push(recId);
            this.deleteRecords(idList);
        }
        }
        deleteRecords(idList){
            console.log('To Be Deleted:'+JSON.stringify(idList));
            deleteSubTasks({idList: idList})
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
        deleteSelectedSubTasks(event){
            var idList = [];
            var selectedRows = this.selectedRows;
            for(var x in selectedRows){
                idList.push(selectedRows[x].Id);
            }
            this.deleteRecords(idList);
        }
    

}