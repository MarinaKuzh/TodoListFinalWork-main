import {LightningElement, track, wire} from 'lwc';
import SUB_TODO_Object from '@salesforce/schema/Sub_Todo__c';
import SUB_TODO_NAME from '@salesforce/schema/Sub_Todo__c.Name';
import SUB_TODO_DESCRIPTION from '@salesforce/schema/Sub_Todo__c.Description__c';
import SUB_TODO_STATUS from '@salesforce/schema/Sub_Todo__c.Status__c';

// importing apex class methods
import getSubTodoList from '@salesforce/apex/SubTodoListController.getSubTodoList';
import fetchSubTodos from '@salesforce/apex/SubTodoListController.fetchSubTodos'; 
import delSelectedSubTodos from '@salesforce/apex/SubTodoListController.deleteSubTodos';


// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

// importing to refresh the apex if any record changes the datas
import {refreshApex} from '@salesforce/apex';

// row actions
const actions = [
    { label: 'Record Details', name: 'record_details'}, 
    { label: 'Edit', name: 'edit'}, 
    { label: 'Delete', name: 'delete'}
];

// datatable columns with row actions
const columns = [
    { label: 'Name', fieldName: SUB_TODO_NAME.fieldApiName }, 
    { label: 'Description', fieldName: SUB_TODO_DESCRIPTION.fieldApiName, type: 'text'},
    { label: 'Status', fieldName: SUB_TODO_STATUS.fieldApiName, type: 'picklist'}, 
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'right'
        }
    }
];

export default class SubTodo extends LightningElement {
    @track subTodos;
    @track data;
    @track columns = columns;
    @track record = [];
    @track bShowModal = false;
    @track currentRecordId;
    @track isEditForm = false;
    @track showLoadingSpinner = false;
    @track error;

    objectApiName = SUB_TODO_Object;
    openModal = false;

    subTodoName = SUB_TODO_NAME;
    subTodoDescription = SUB_TODO_DESCRIPTION;
    subTodoStatus = SUB_TODO_STATUS;
    selectedRecords = [];
    refreshTable;
    searchValue = '';

    showModal(){
        this.openModal=true;
    }
    closeModalCreate(){
        this.openModal=false;
    }

   handleSuccessModal(){
       if(this.recordId!==null){
           this.openModal = false;
           this.dispatchEvent(new ShowToastEvent({
               title: "Success" ,
               message: "New record has been created." ,
               variant: "success",
           }),);
           return refreshApex(this.refreshTable);
       }
   }
   @wire(getSubTodoList)
    subTodos(result) {
        this.refreshTable = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }
    handleKeyChange( event ) {  
            
        const searchKey = event.target.value;  
  
        if ( searchKey ) {  
  
            fetchSubTodos( { searchKey } )    
            .then(result => {  
  
                this.subTodos = result;  
  
            })  
            .catch(error => {  
  
                this.error = error;  
  
            });  
  
        } else  
        this.subTodos = undefined;  
  
    }      
    handleRowActions(event) {
        let actionName = event.detail.action.name;

        window.console.log('actionName ====> ' + actionName);

        let row = event.detail.row;

        window.console.log('row ====> ' + row);
        // eslint-disable-next-line default-case
        switch (actionName) {
            case 'record_details':
                this.viewCurrentRecord(row);
                break;
            case 'edit':
                this.editCurrentRecord(row);
                break;
            case 'delete':
                this.deleteSubTodo(row);
                break;
        }
    }
     // view the current record details
     viewCurrentRecord(currentRow) {
        this.bShowModal = true;
        this.isEditForm = false;
        this.record = currentRow;
    }

    // closing modal box
    closeModal() {
        this.bShowModal = false;
    }


    editCurrentRecord(currentRow) {
        // open modal box
        this.bShowModal = true;
        this.isEditForm = true;

        // assign record id to the record edit form
        this.currentRecordId = currentRow.Id;
    }

    // handleing record edit form submit
    handleSubmit(event) {
        // prevending default type sumbit of record edit form
        event.preventDefault();

        // querying the record edit form and submiting fields to form
        this.template.querySelector('lightning-record-edit-form').submit(event.detail.fields);

        // closing modal
        this.bShowModal = false;

        // showing success message
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success!!',
            message:' Sub Todo updated Successfully!!.',
            variant: 'success'
        }),);

    }

    // refreshing the datatable after record edit form success
    handleSuccess() {
        return refreshApex(this.refreshTable);
    }

    deleteSubTodo(currentRow) {
        let currentRecord = [];
        currentRecord.push(currentRow.Id);
        this.showLoadingSpinner = true;

        // calling apex class method to delete the selected contact
        delSelectedSubTodos({lstSubTodoIds: currentRecord})
        .then(result => {
            window.console.log('result ====> ' + result);
            this.showLoadingSpinner = false;

            // showing success message
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success!!',
                message:' Todo deleted.',
                variant: 'success'
            }),);

            // refreshing table data using refresh apex
             return refreshApex(this.refreshTable);

        })
        .catch(error => {
            window.console.log('Error ====> '+error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!!', 
                message: error.message, 
                variant: 'error'
            }),);
        });
    }


}