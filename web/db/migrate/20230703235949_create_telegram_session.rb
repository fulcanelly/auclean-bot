class CreateTelegramSession < ActiveRecord::Migration[7.0]
  def change
    create_table :telegram_sessions do |t|
      t.bigint :telegram_user_id
      t.string :phone_numbe
      t.integer :linked_to
шщщлбдх=хжюжхэ=
      t.timestamps
    end
  end
end
