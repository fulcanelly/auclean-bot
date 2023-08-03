class TelegramSessionsController < ApplicationController
  before_action :set_telegram_session, only: %i[ show update destroy ]

  # GET /telegram_sessions
  def index
    @telegram_sessions = TelegramSession.all

    render json: @telegram_sessions
  end

  # GET /telegram_sessions/1
  def show
    render json: @telegram_session
  end

  # POST /telegram_sessions
  def create
    @telegram_session = TelegramSession.new(telegram_session_params)

    if @telegram_session.save
      render json: @telegram_session, status: :created, location: @telegram_session
    else
      render json: @telegram_session.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /telegram_sessions/1
  def update
    if @telegram_session.update(telegram_session_params)
      render json: @telegram_session
    else
      render json: @telegram_session.errors, status: :unprocessable_entity
    end
  end

  # DELETE /telegram_sessions/1
  def destroy
    @telegram_session.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_telegram_session
      @telegram_session = TelegramSession.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def telegram_session_params
      params.require(:telegram_session).permit(:telegram_user_id, :phone_number, :linked_to)
    end
end
