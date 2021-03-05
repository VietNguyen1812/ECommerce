using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TinhLaiNganHang
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            textBox1.Text = DateTime.Now.ToString("dd-MM-yyyy");
            textBox2.Text = DateTime.Now.AddYears(1).ToString("dd-MM-yyyy");
            Globals.setm(0);
            Globals.setn(0);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            try
            {
                TinhLai();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }


        public void TinhLai()
        {
            //Lay thong tin can thiet 
            Globals.setNgayGui( DateTime.ParseExact(textBox1.Text, "dd-MM-yyyy", CultureInfo.InvariantCulture));
            Globals.setNgayRut(DateTime.ParseExact(textBox2.Text, "dd-MM-yyyy", CultureInfo.InvariantCulture));
            Globals.setTienGoc(float.Parse(txtTienGoc.Text));

            Globals.TinhLai();


            txtTienLai.Text = Globals.TienGoc+"";
            label5.Text=    Globals.NgayGui.ToString("dd-MM-yyyy");
        }

        private void label12_Click(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            try
            {
                Globals.setKhongKiHan(float.Parse(txtLaikkihan.Text), DateTime.ParseExact(datekkihan.Text, "dd-MM-yyyy", CultureInfo.InvariantCulture));
                Globals.setKiHan(float.Parse(txtLaikihan.Text), DateTime.ParseExact(datekihan.Text, "dd-MM-yyyy", CultureInfo.InvariantCulture));
                Xuat();
            }
            catch(Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }


        public void Xuat()
        {
            string txt1 = "";
            for(int i=0; i<Globals.n; i++)
            {
                txt1 += "   " + Globals.dateLaiKiHan[i] + "   " + Globals.tableLaiKiHan[i]+",";
                label15.Text = txt1;
            }
            string txt = "";
            for (int i = 0; i < Globals.m; i++)
            {
                txt += "   " + Globals.dateLaiThongThuong[i] + "   " + Globals.tableLaiThongThuong[i] + ",";
                label16.Text = txt;
            }

        }
    }
}
