Rails.application.routes.draw do
  resources :tasks, only: ['index', 'create'] do
    collection do
      post :complete
    end
  end
end

