import {LightningElement, track, wire} from 'lwc';
import TODO_Object from '@salesforce/schema/Todo__c';
import TODO_NAME from '@salesforce/schema/Todo__c.Name';
import TODO_DESCRIPTION from '@salesforce/schema/Todo__c.Description__c';
import TODO_DEADLINE_DATE from '@salesforce/schema/Todo__c.Deadline_date__c';
import TODO_PRIORITY from '@salesforce/schema/Todo__c.Priority__c';
import TODO_STATUS from '@salesforce/schema/TODO__C.Status__c';

// importing apex class methods
import getTodoList from '@salesforce/apex/TodoListController.getTodoList';
import fetchTodos from '@salesforce/apex/TodoListController.fetchTodos'; 
import delSelectedTodos from '@salesforce/apex/TodoListController.deleteTodos';


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
    { label: 'Name', fieldName: TODO_NAME.fieldApiName }, 
    { label: 'Description', fieldName: TODO_DESCRIPTION.fieldApiName, type: 'text'},
    { label: 'Status', fieldName: TODO_STATUS.fieldApiName, type: 'picklist'}, 
    { label: 'Priority', fieldName: TODO_PRIORITY.fieldApiName, type: 'picklist' }, 
    {label: 'Deadline Date' , fieldName: TODO_DEADLINE_DATE.fieldApiName, type:'date'},
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'right'
        }
    }
];
export default class TodoList extends LightningElement {
    // reactive variable
    @track todos;
    @track data;
    @track columns = columns;
    @track record = [];
    @track bShowModal = false;
    @track currentRecordId;
    @track isEditForm = false;
    @track showLoadingSpinner = false;
    @track error;
    // non-reactive variables
    todoName = TODO_NAME;
    todoDescription = TODO_DESCRIPTION;
    todoDeadlineDate = TODO_DEADLINE_DATE;
    todoPriority = TODO_PRIORITY;
    todoStatus = TODO_STATUS;
    selectedRecords = [];
    refreshTable;
    searchValue = '';
    
    objectApiName = TODO_Object;
    openModal = false;
    

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
    // retrieving the data using wire service
    @wire(getTodoList)
    todos(result) {
        this.refreshTable = result;
        console.log(result," getTodosList");
        if (result.data) {
            this.data = result.data;
            this.error = undefined;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }
   handleKeyChange( event ) {  
 /*   
               
        const searchKey = event.target.value;  
        console.log("handleKeyChange searchKey [",searchKey, "]" );

        if ( searchKey ) {  
  
            fetchTodos( { searchKey } )    
            .then(result => {  
  
                this.todos = result;  
                console.log("result", result);
  
            })  
            .catch(error => {  
  
                this.error = error;  
  console.log("error", error);
            });  
  
        }  */
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
                this.deleteTodos(row);
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
            message:' Todo updated Successfully!!.',
            variant: 'success'
        }),);

    }

    // refreshing the datatable after record edit form success
    handleSuccess() {
        return refreshApex(this.refreshTable);
    }

    deleteTodos(currentRow) {
        let currentRecord = [];
        currentRecord.push(currentRow.Id);
        this.showLoadingSpinner = true;

        // calling apex class method to delete the selected contact
        delSelectedTodos({lstTodoIds: currentRecord})
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