import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotAiComponent } from'./chatbot-ai/chatbot-ai.component';

const routes: Routes = [
{
  path: 'chatbot-ai',
  component: ChatbotAiComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})


export class AppRoutingModule { }
