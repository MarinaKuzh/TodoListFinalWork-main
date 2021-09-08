import { LightningElement, wire, track} from 'lwc';
import fetchTodos from '@salesforce/apex/TodoListController.fetchTodos';  
import { NavigationMixin } from 'lightning/navigation';


import TODO_NAME from '@salesforce/schema/Todo__c.Name';
import TODO_DESCRIPTION from '@salesforce/schema/Todo__c.Description__c';
import TODO_DEADLINE_DATE from '@salesforce/schema/Todo__c.Deadline_Date__c';
import TODO_PRIORITY from '@salesforce/schema/Todo__c.Priority__c';
import TODO_STATUS from '@salesforce/schema/Todo__c.Status__c';
import getTodoList from '@salesforce/apex/TodoListController.getTodoList';


const COLUMNS=[
    {label: 'Name' , fieldName: TODO_NAME.fieldApiName, type:'text'},
    {label: 'Description' , fieldName: TODO_DESCRIPTION.fieldApiName, type:'text'},
    {label: 'Priority' , fieldName: TODO_PRIORITY.fieldApiName, type:'checkbox'},
    {label: 'Status' , fieldName: TODO_STATUS.fieldApiName, type:'checkbox'},
    {label: 'Deadline Date' , fieldName: TODO_DEADLINE_DATE.fieldApiName, type:'date'},
    {type: "button-icon", typeAttributes: {  
        iconName: "utility:edit",
        label: 'Edit',  
        name: 'Edit',  
        title: 'Edit',  
        disabled: false,  
        value: 'edit',  
        iconPosition: 'left'  
    }} ,
    {type: "button-icon", typeAttributes: {  
        iconName: "utility:delete",
        label: 'Delete',  
        name: 'Delete',  
        title: 'Delete',  
        disabled: false,  
        value: 'delete',  
        iconPosition: 'left'  
    }}  
  ];

export default class TodoList extends LightningElement {
  data = [];
  

    @wire (getTodoList)
    wiredTodos(result) {
        this.wiredTodosResult = result;
        if (result.data) {
            this.todos = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.todos = undefined;
        }
    }


      @track todos;  
      @track error;  
      @track  columns = COLUMNS;
    
      handleKeyChange( event ) {  
            
          const searchKey = event.target.value;  
    
          if ( searchKey ) {  
    
              fetchTodos( { searchKey } )    
              .then(result => {  
    
                  this.todos = result;  
    
              })  
              .catch(error => {  
    
                  this.error = error;  
    
              });  
    
          } else  
          this.todos = undefined;  
    
      }      
        
      callRowAction( event ) {  
            
          const recId =  event.detail.row.Id;  
          const actionName = event.detail.action.name;  
          if ( actionName === 'Edit' ) {  
    
              this[NavigationMixin.Navigate]({  
                  type: 'standard__recordPage',  
                  attributes: {  
                      recordId: recId,  
                      objectApiName: 'Todo__c',  
                      actionName: 'edit'  
                  }  
              })  
    
          } else if ( actionName === 'Delete') {  
    
                const recordId = event.target.dataset.recordid;
                deleteRecord(recordId)
                    .then(() => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: 'Todo deleted',
                                variant: 'success'
                            })
                        );
                        return refreshApex(this.wiredTodosResult);
                    })
                    .catch((error) => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error deleting record',
                                message: reduceErrors(error).join(', '),
                                variant: 'error'
                            })
                        );
                    });
                  }  
              }
    
          }          
    
