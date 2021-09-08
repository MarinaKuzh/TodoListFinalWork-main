import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import TODO_Object from '@salesforce/schema/Todo__c';
import TODO_NAME from '@salesforce/schema/Todo__c.Name';
import TODO_DESCRIPTION from '@salesforce/schema/Todo__c.Description__c';
import TODO_DEADLINE_DATE from '@salesforce/schema/Todo__c.Deadline_Date__c';
import TODO_PRIORITY from '@salesforce/schema/Todo__c.Priority__c';
import TODO_STATUS from '@salesforce/schema/TODO__C.Status__c';



export default class TodoCreate extends LightningElement {
   
    todoName = TODO_NAME;
    todoDescription = TODO_DESCRIPTION;
    todoDeadlineDate = TODO_DEADLINE_DATE;
    todoPriority = TODO_PRIORITY;
    todoStatus = TODO_STATUS;
    objectApiName = TODO_Object;
    openModal = false;

    showModal(){
        this.openModal=true;
    }
    closeModal(){
        this.openModal=false;
    }

   handleSuccess(){
       if(this.recordId!==null){
           this.openModal = false;
           this.dispatchEvent(new ShowToastEvent({
               title: "Success" ,
               message: "New record has been created." ,
               variant: "success",
           }),);
       }
   }
}

