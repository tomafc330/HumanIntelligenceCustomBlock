Rails.application.routes.draw do
  resources :tasks, only: ['index', 'create'] do
    collection do
      get :complete
    end

  end
end

