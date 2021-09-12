import {LightningElement, track, wire} from 'lwc';
import SUB_TODO_Object from '@salesforce/schema/Activity';
import SUB_TODO_NAME from '@salesforce/schema/Activity.Name__c';
import SUB_TODO_DESCRIPTION from '@salesforce/schema/Activity.Description__c';
import SUB_TODO_STATUS from '@salesforce/schema/Activity.Status__c';

// importing apex class methods
import getSubTask from '@salesforce/apex/SubTodoListController.getSubTask'; 
import delSelectedSubTasks from '@salesforce/apex/SubTodoListController.deleteSubTasks';


// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

// importing to refresh the apex if any record changes the datas
import {refreshApex} from '@salesforce/apex';

// row actions
const actions = [
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
    @track subTasks;
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
                this.deleteSubTask(row);
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

    deleteSubTask(currentRow) {
        let currentRecord = [];
        currentRecord.push(currentRow.Id);
        this.showLoadingSpinner = true;

        // calling apex class method to delete the selected contact
        delSelectedSubTasks({lstSubTaskIds: currentRecord})
        .then(result => {
            window.console.log('result ====> ' + result);
            this.showLoadingSpinner = false;

            // showing success message
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success!!',
                message:' Sub Todo deleted.',
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